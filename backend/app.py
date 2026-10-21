import os
import re
from datetime import datetime, timedelta, timezone
from functools import wraps
from uuid import uuid4

import click
import jwt
from flask import Flask, g, jsonify, request, send_from_directory
from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError, OperationalError
from werkzeug.utils import secure_filename

try:
    from .models import AuditLog, Document, Driver, Incident, Invoice, Load, Role, TrackingLocation, User, db, now_utc
    from .seed import seed_database
except ImportError:
    from models import AuditLog, Document, Driver, Incident, Invoice, Load, Role, TrackingLocation, User, db, now_utc
    from seed import seed_database


def load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as env_file:
        for line in env_file:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


def create_app(test_config=None):
    load_env_file()
    app = Flask(__name__)
    database_url = os.environ.get("DATABASE_URL")
    jwt_secret_key = os.environ.get("JWT_SECRET_KEY")
    if not database_url:
        raise RuntimeError("DATABASE_URL must be set in backend/.env.")
    if not jwt_secret_key or not re.fullmatch(r"[0-9a-fA-F]{64}", jwt_secret_key):
        raise RuntimeError(
            "JWT_SECRET_KEY must be a 64-character hexadecimal secret. "
            "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
        )
    app.config.update(
        SQLALCHEMY_DATABASE_URI=database_url,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=jwt_secret_key,
    )
    if test_config:
        app.config.update(test_config)

    db.init_app(app)

    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS"
        return response

    @app.route("/api/<path:_path>", methods=["OPTIONS"])
    def options_handler(_path):
        return ("", 204)

    @app.cli.command("init-db")
    def init_db_command():
        db.create_all()
        seed_database()
        print("Database initialized.")

    @app.cli.command("create-admin")
    def create_admin_command():
        email = click.prompt("Admin email").strip().lower()
        name = click.prompt("Admin name").strip()
        company = click.prompt("Company", default="YDHM Logistics Corp.").strip()
        password = click.prompt("Admin password", hide_input=True, confirmation_prompt=True)

        if not email or not name:
            raise click.ClickException("Admin email and name are required.")
        if len(password) < 12:
            raise click.ClickException("Admin password must contain at least 12 characters.")
        user = User.query.filter_by(email=email).first()
        if user is not None and user.active:
            raise click.ClickException("A user with this email already exists.")

        if user is None:
            user = User(
                id=f"ADM-{uuid4().hex[:8].upper()}",
                name=name,
                email=email,
                company=company,
                role_id="manager",
            )
            db.session.add(user)
        else:
            user.id = f"ADM-{uuid4().hex[:8].upper()}"
            user.name = name
            user.company = company
            user.role_id = "manager"
            user.active = True
        user.set_password(password)
        db.session.commit()
        click.echo(f"Manager account created for {email}.")

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "ydhm-logistics-api", "database": db.engine.url.get_backend_name()})

    @app.post("/api/auth/register")
    def register():
        payload = request.get_json(silent=True) or {}
        required = ["name", "email", "password"]
        missing = [field for field in required if not payload.get(field)]
        if missing:
            return jsonify({"error": "Missing required fields", "fields": missing}), 400

        role_id = "customer"
        role = db.session.get(Role, role_id)
        if role is None:
            return jsonify({"error": "Customer role is unavailable"}), 503

        user = User(
            **({"id": f"ADM-{uuid4().hex[:8].upper()}"} if role.id == "manager" else {}),
            name=payload["name"],
            email=payload["email"].lower(),
            company=payload.get("company", "YDHM Logistics Corp."),
            role_id=role_id,
        )
        user.set_password(payload["password"])
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "Email already registered"}), 409

        add_audit(f"User {user.email} registered as {role.label}.")
        return jsonify({"token": make_token(user), "user": user.to_dict()}), 201

    @app.post("/api/auth/login")
    def login():
        payload = request.get_json(silent=True) or {}
        email = (payload.get("email") or "").lower()
        password = payload.get("password") or ""
        user = User.query.filter_by(email=email).first()
        if user is None or not user.active or not user.check_password(password):
            return jsonify({"error": "Invalid credentials"}), 401

        add_audit(f"User {user.email} logged in.")
        return jsonify({"token": make_token(user), "user": user.to_dict()})

    @app.get("/api/auth/me")
    @require_auth
    def me():
        return jsonify(g.current_user.to_dict())

    @app.get("/api/bootstrap")
    @require_auth
    def bootstrap():
        scoped_loads = scoped_load_query().order_by(Load.id).all()
        scoped_load_ids = [load.id for load in scoped_loads]
        return jsonify({
            "roles": {role.id: role.to_dashboard() for role in Role.query.order_by(Role.id).all()},
            "navigation": [
                {"id": "overview", "label": "Dashboard"},
                {"id": "loads", "label": "Cargas"},
                {"id": "dispatch", "label": "Dispatch"},
                {"id": "routes", "label": "Rutas"},
                {"id": "driver", "label": "Driver app"},
                {"id": "tracking", "label": "Tracking"},
                {"id": "documents", "label": "Documentos"},
                {"id": "invoices", "label": "Facturacion"},
                {"id": "incidents", "label": "Incidencias"},
                {"id": "users", "label": "Usuarios"},
                {"id": "audit", "label": "Auditoria"},
                {"id": "support", "label": "Soporte"},
            ],
            "loads": [serialize_load(item) for item in scoped_loads],
            "documents": [item.to_dict() for item in scoped_document_query(scoped_load_ids).order_by(Document.id).all()],
            "invoices": [item.to_dict() for item in scoped_invoice_query(scoped_load_ids).order_by(Invoice.id).all()],
            "drivers": list_truckers(),
            "incidents": [item.to_dict() for item in scoped_incident_query(scoped_load_ids).order_by(Incident.id).all()],
            "users": [item.to_dict() for item in scoped_user_query().order_by(User.id).all()],
            "audit": scoped_audit_messages(scoped_load_ids),
        })

    @app.get("/api/roles")
    def roles():
        return jsonify({role.id: role.to_dashboard() for role in Role.query.order_by(Role.id).all()})

    @app.get("/api/loads")
    @require_auth
    def list_loads():
        return jsonify([serialize_load(item) for item in scoped_load_query().order_by(Load.id).all()])

    @app.post("/api/loads")
    @require_auth
    def create_load():
        if g.current_user.role_id not in {"dispatcher", "manager"}:
            return jsonify({"error": "Only managers and dispatchers can create loads"}), 403

        payload = request.get_json(silent=True) or {}
        required = ["customer", "origin", "destination", "pickup", "delivery"]
        missing = [field for field in required if not payload.get(field)]
        if missing:
            return jsonify({"error": "Missing required fields", "fields": missing}), 400
        load = Load(
            customer=payload["customer"],
            origin=payload["origin"],
            destination=payload["destination"],
            pickup=payload["pickup"],
            delivery=payload["delivery"],
            driver=payload.get("driver", "Unassigned"),
            status=payload.get("status", "Pending Assignment"),
            docs=0,
            invoice=payload.get("invoice", "Draft"),
            rate=payload.get("rate", 0),
        )
        apply_load_timing(load)
        db.session.add(load)
        db.session.commit()
        add_audit(f"Created load {load.id}.")
        return jsonify(serialize_load(load)), 201

    @app.get("/api/loads/<load_id>")
    @require_auth
    def get_load(load_id):
        load = Load.query.get_or_404(load_id)
        if not can_access_load(load):
            return jsonify({"error": "Load not found"}), 404
        return jsonify(serialize_load(load))

    @app.patch("/api/loads/<load_id>")
    @require_auth
    def update_load(load_id):
        if g.current_user.role_id not in {"dispatcher", "manager"}:
            return jsonify({"error": "Only managers and dispatchers can update loads"}), 403

        load = Load.query.get_or_404(load_id)
        payload = request.get_json(silent=True) or {}
        update_model(load, payload, [
            "customer",
            "driver",
            "origin",
            "destination",
            "pickup",
            "delivery",
            "status",
            "invoice",
            "rate",
            "route_stops",
            "route_notes",
            "route_distance",
            "route_duration",
            "route_geometry",
        ])
        apply_load_timing(load)
        db.session.commit()
        add_audit(f"Updated load {load.id}.")
        return jsonify(serialize_load(load))

    @app.post("/api/loads/<load_id>/assign")
    @require_auth
    def assign_load(load_id):
        if g.current_user.role_id not in {"dispatcher", "manager"}:
            return jsonify({"error": "Only managers and dispatchers can assign loads"}), 403

        load = Load.query.get_or_404(load_id)
        payload = request.get_json(silent=True) or {}
        driver = payload.get("driver")
        if not driver:
            return jsonify({"error": "driver is required"}), 400
        load.driver = driver
        load.status = "Awaiting Driver Confirmation"
        apply_load_timing(load)
        db.session.commit()
        add_audit(f"{load.id} assigned to {driver}.")
        return jsonify(serialize_load(load))

    @app.post("/api/loads/<load_id>/status")
    @require_auth
    def change_load_status(load_id):
        load = Load.query.get_or_404(load_id)
        payload = request.get_json(silent=True) or {}
        status = payload.get("status")
        if not status:
            return jsonify({"error": "status is required"}), 400
        load.status = status
        apply_load_timing(load)
        db.session.commit()
        add_audit(f"{load.id} changed status to {status}.")
        return jsonify(serialize_load(load))

    @app.get("/api/drivers")
    def list_drivers():
        return jsonify(list_truckers())

    @app.get("/api/documents")
    @require_auth
    def list_documents():
        load_ids = [load.id for load in scoped_load_query().all()]
        return jsonify([item.to_dict() for item in scoped_document_query(load_ids).order_by(Document.id).all()])

    @app.post("/api/documents")
    @require_auth
    def create_document():
        if g.current_user.role_id not in {"driver", "trucker", "dispatcher", "manager"}:
            return jsonify({"error": "Only truckers, dispatchers and managers can upload documents"}), 403

        is_multipart = request.content_type and request.content_type.startswith("multipart/form-data")
        payload = request.form if is_multipart else (request.get_json(silent=True) or {})
        required = ["load", "type"]
        missing = [field for field in required if not payload.get(field)]
        if missing:
            return jsonify({"error": "Missing required fields", "fields": missing}), 400
        load = Load.query.get(payload["load"])
        if load is None:
            return jsonify({"error": "Invalid load"}), 400
        uploaded_file = request.files.get("file") if is_multipart else None
        stored_file = save_uploaded_file(uploaded_file) if uploaded_file and uploaded_file.filename else {}

        document = Document(
            load=payload["load"],
            type=payload["type"],
            owner=payload.get("owner", g.current_user.name),
            status=payload.get("status", "Review"),
            visibility=payload.get("visibility", "Operaciones"),
            file_name=stored_file.get("file_name", ""),
            file_path=stored_file.get("file_path", ""),
            mime_type=stored_file.get("mime_type", ""),
        )
        db.session.add(document)
        sync_load_doc_count(load)
        db.session.commit()
        add_audit(f"Created document {document.id}.")
        return jsonify(document.to_dict()), 201

    @app.get("/api/documents/<document_id>/file")
    @require_auth
    def download_document_file(document_id):
        document = Document.query.get_or_404(document_id)
        load = Load.query.get(document.load)
        if load is None or not can_access_load(load):
            return jsonify({"error": "Document not found"}), 404
        if not document.file_path:
            return jsonify({"error": "Document has no uploaded file"}), 404
        return send_from_directory(
            get_upload_dir(),
            document.file_path,
            as_attachment=False,
            download_name=document.file_name or document.file_path,
        )

    @app.delete("/api/documents/<document_id>")
    @require_auth
    def delete_document(document_id):
        document = Document.query.get_or_404(document_id)
        if g.current_user.role_id not in {"dispatcher", "manager"} and document.owner != g.current_user.name:
            return jsonify({"error": "Only managers, dispatchers or the uploader can delete this document"}), 403
        load = Load.query.get(document.load)
        file_path = document.file_path
        db.session.delete(document)
        db.session.flush()
        if load:
            sync_load_doc_count(load)
        delete_uploaded_file(file_path)
        db.session.commit()
        add_audit(f"Deleted document {document_id}.")
        return jsonify({"deleted": document_id})

    @app.post("/api/documents/<document_id>/approve")
    @require_auth
    def approve_document(document_id):
        document = Document.query.get_or_404(document_id)
        document.status = "Approved"
        db.session.commit()
        add_audit(f"Document {document.id} approved by {g.current_user.name}.")
        return jsonify(document.to_dict())

    @app.get("/api/invoices")
    @require_auth
    def list_invoices():
        load_ids = [load.id for load in scoped_load_query().all()]
        return jsonify([item.to_dict() for item in scoped_invoice_query(load_ids).order_by(Invoice.id).all()])

    @app.post("/api/invoices")
    @require_auth
    def create_invoice():
        if g.current_user.role_id not in {"dispatcher", "manager"}:
            return jsonify({"error": "Only managers and dispatchers can create invoices"}), 403

        payload = request.get_json(silent=True) or {}
        load_id = payload.get("load")
        if not load_id:
            return jsonify({"error": "load is required"}), 400
        load = Load.query.get(load_id)
        if load is None:
            return jsonify({"error": "Invalid load"}), 400
        existing_invoice = Invoice.query.filter_by(load=load.id).first()
        if existing_invoice is not None:
            return jsonify({"error": "This load already has an invoice"}), 409

        invoice = Invoice(
            load=load.id,
            customer=load.customer,
            total=payload.get("total", load.rate),
            status=payload.get("status", "Ready"),
            due=payload.get("due", ""),
        )
        load.invoice = invoice.status
        db.session.add(invoice)
        db.session.commit()
        add_audit(f"Invoice {invoice.id} created for {load.id}.")
        return jsonify(invoice.to_dict()), 201

    @app.post("/api/invoices/<invoice_id>/issue")
    @require_auth
    def issue_invoice(invoice_id):
        if g.current_user.role_id not in {"dispatcher", "manager"}:
            return jsonify({"error": "Only managers and dispatchers can issue invoices"}), 403

        invoice = Invoice.query.get_or_404(invoice_id)
        invoice.status = "Issued"
        load = Load.query.get(invoice.load)
        if load:
            load.invoice = "Issued"
        db.session.commit()
        add_audit(f"Invoice {invoice.id} issued to customer portal.")
        return jsonify(invoice.to_dict())

    @app.get("/api/incidents")
    @require_auth
    def list_incidents():
        load_ids = [load.id for load in scoped_load_query().all()]
        return jsonify([item.to_dict() for item in scoped_incident_query(load_ids).order_by(Incident.id).all()])

    @app.post("/api/incidents")
    @require_auth
    def create_incident():
        if g.current_user.role_id not in {"driver", "trucker", "dispatcher", "manager"}:
            return jsonify({"error": "Only truckers, dispatchers and managers can create incidents"}), 403

        payload = request.get_json(silent=True) or {}
        load_id = payload.get("load")
        if not load_id:
            return jsonify({"error": "load is required"}), 400
        if Load.query.get(load_id) is None:
            return jsonify({"error": "Invalid load"}), 400
        incident = Incident(
            load=load_id,
            type=payload.get("type", "Other"),
            priority=payload.get("priority", "Medium"),
            status="Open",
            description=payload.get("description", ""),
        )
        db.session.add(incident)
        db.session.commit()
        add_audit(f"Incident {incident.id} reported for {incident.load}.")
        return jsonify(incident.to_dict()), 201

    @app.post("/api/incidents/<incident_id>/resolve")
    @require_auth
    def resolve_incident(incident_id):
        if g.current_user.role_id not in {"dispatcher", "manager"}:
            return jsonify({"error": "Only managers and dispatchers can resolve incidents"}), 403

        incident = Incident.query.get_or_404(incident_id)
        incident.status = "Resolved"
        incident.resolved_at = now_utc()
        db.session.commit()
        add_audit(f"Incident {incident.id} resolved.")
        return jsonify(incident.to_dict())

    @app.get("/api/tracking/<load_id>")
    @require_auth
    def get_tracking(load_id):
        load = Load.query.get_or_404(load_id)
        if not can_access_load(load):
            return jsonify({"error": "Tracking not found"}), 404
        points = TrackingLocation.query.filter_by(load=load_id).order_by(TrackingLocation.recorded_at).all()
        return jsonify([item.to_dict() for item in points])

    @app.get("/api/tracking/<load_id>/live")
    @require_auth
    def get_live_tracking(load_id):
        load = Load.query.get_or_404(load_id)
        if not can_access_load(load):
            return jsonify({"error": "Tracking not found"}), 404
        latest_point = refresh_cached_tracking_location(load)
        points = TrackingLocation.query.filter_by(load=load_id).order_by(TrackingLocation.recorded_at).all()
        return jsonify({
            "load": serialize_load(load),
            "location": latest_point.to_dict() if latest_point else None,
            "history": [item.to_dict() for item in points[-25:]],
            "refresh_seconds": TRACKING_REFRESH_SECONDS,
        })

    @app.post("/api/tracking/<load_id>/location")
    @require_auth
    def record_tracking_location(load_id):
        if g.current_user.role_id not in {"driver", "trucker", "dispatcher", "manager"}:
            return jsonify({"error": "Only truckers, dispatchers and managers can update tracking"}), 403
        load = Load.query.get_or_404(load_id)
        if not can_access_load(load):
            return jsonify({"error": "Tracking not found"}), 404
        payload = request.get_json(silent=True) or {}
        try:
            latitude = float(payload.get("latitude"))
            longitude = float(payload.get("longitude"))
        except (TypeError, ValueError):
            return jsonify({"error": "latitude and longitude are required"}), 400
        point = TrackingLocation(
            load=load.id,
            latitude=latitude,
            longitude=longitude,
            label=payload.get("label") or f"GPS update from {g.current_user.name}",
        )
        db.session.add(point)
        db.session.commit()
        return jsonify(point.to_dict()), 201

    @app.get("/api/users")
    @require_auth
    def list_users():
        if g.current_user.role_id != "manager":
            return jsonify({"error": "Only managers can list users"}), 403
        return jsonify([item.to_dict() for item in User.query.order_by(User.id).all()])

    @app.post("/api/users")
    @require_auth
    def create_user():
        if g.current_user.role_id != "manager":
            return jsonify({"error": "Only managers can create users"}), 403

        payload = request.get_json(silent=True) or {}
        required = ["name", "email", "password", "role"]
        missing = [field for field in required if not payload.get(field)]
        if missing:
            return jsonify({"error": "Missing required fields", "fields": missing}), 400

        role = Role.query.get(payload["role"])
        if role is None:
            return jsonify({"error": "Invalid role"}), 400

        user = User(
            name=payload["name"],
            email=payload["email"].lower(),
            company=payload.get("company", "YDHM Logistics Corp."),
            role_id=role.id,
            active=payload.get("active", True),
        )
        user.set_password(payload["password"])
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "Email already registered"}), 409

        add_audit(f"Manager {g.current_user.email} created user {user.email} as {role.label}.")
        return jsonify(user.to_dict()), 201

    @app.patch("/api/users/<user_id>")
    @require_auth
    def update_user(user_id):
        if g.current_user.role_id != "manager":
            return jsonify({"error": "Only managers can update users"}), 403

        user = User.query.get_or_404(user_id)
        payload = request.get_json(silent=True) or {}

        if "role" in payload:
            role = Role.query.get(payload["role"])
            if role is None:
                return jsonify({"error": "Invalid role"}), 400
            user.role_id = role.id
            if role.id == "manager" and not user.id.startswith("ADM-"):
                user.id = f"ADM-{uuid4().hex[:8].upper()}"
        if "name" in payload:
            user.name = payload["name"]
        if "email" in payload:
            user.email = payload["email"].lower()
        if "company" in payload:
            user.company = payload["company"]
        if "active" in payload:
            user.active = bool(payload["active"])
        if payload.get("password"):
            user.set_password(payload["password"])

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return jsonify({"error": "Email already registered"}), 409

        add_audit(f"Manager {g.current_user.email} updated user {user.email}.")
        return jsonify(user.to_dict())

    @app.delete("/api/users/<user_id>")
    @require_auth
    def delete_user(user_id):
        if g.current_user.role_id != "manager":
            return jsonify({"error": "Only managers can delete users"}), 403
        if g.current_user.id == user_id:
            return jsonify({"error": "Managers cannot delete their own user"}), 400

        user = User.query.get_or_404(user_id)
        user.active = False
        db.session.commit()
        add_audit(f"Manager {g.current_user.email} deactivated user {user.email}.")
        return jsonify(user.to_dict())

    @app.get("/api/audit")
    @require_auth
    def audit():
        load_ids = [load.id for load in scoped_load_query().all()]
        return jsonify(scoped_audit_messages(load_ids))

    with app.app_context():
        if not test_config or test_config.get("INIT_DB", True):
            try:
                db.create_all()
                ensure_document_attachment_columns()
                ensure_load_route_columns()
                seed_database()
            except (OperationalError, UnicodeDecodeError) as error:
                raise RuntimeError(
                    "Could not connect to PostgreSQL. Check that the Docker container "
                    "ydhm-logistics-postgres is running and that backend/.env uses "
                    "DATABASE_URL=postgresql+psycopg://postgres:postgres@127.0.0.1:5433/ydhm_logistics"
                ) from error

    return app


def make_token(user):
    payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, current_app_secret(), algorithm="HS256")


def current_app_secret():
    from flask import current_app

    return current_app.config["JWT_SECRET_KEY"]


def require_auth(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Bearer ", "", 1) if auth_header.startswith("Bearer ") else None
        if not token:
            return jsonify({"error": "Authentication required"}), 401
        try:
            payload = jwt.decode(token, current_app_secret(), algorithms=["HS256"])
        except jwt.PyJWTError:
            return jsonify({"error": "Invalid or expired token"}), 401
        user = User.query.get(payload.get("sub"))
        if user is None or not user.active:
            return jsonify({"error": "Invalid user"}), 401
        g.current_user = user
        return view(*args, **kwargs)
    return wrapped


def update_model(model, payload, allowed_fields):
    for field in allowed_fields:
        if field in payload:
            setattr(model, field, payload[field])


def add_audit(message):
    db.session.add(AuditLog(message=message))
    db.session.commit()


TRACKING_REFRESH_SECONDS = 120

PLACE_COORDINATES = {
    "atlanta": (33.7490, -84.3880),
    "birmingham": (33.5186, -86.8104),
    "charlotte": (35.2271, -80.8431),
    "hialeah": (25.8576, -80.2781),
    "jacksonville": (30.3322, -81.6557),
    "miami": (25.7617, -80.1918),
    "nashville": (36.1627, -86.7816),
    "orlando": (28.5383, -81.3792),
    "savannah": (32.0809, -81.0912),
    "tampa": (27.9506, -82.4572),
}


def is_customer_user():
    return getattr(g, "current_user", None) is not None and g.current_user.role_id == "customer"


def is_driver_user():
    return getattr(g, "current_user", None) is not None and g.current_user.role_id in {"driver", "trucker"}


def can_access_load(load):
    if is_customer_user():
        return load.customer == g.current_user.company
    if is_driver_user():
        return load.driver == g.current_user.name
    return True


def refresh_cached_tracking_location(load):
    latest_point = TrackingLocation.query.filter_by(load=load.id).order_by(TrackingLocation.recorded_at.desc()).first()
    if latest_point and not should_refresh_tracking_point(latest_point):
        return latest_point
    if load.status in {"Delivered", "Completed"} and latest_point:
        return latest_point

    latitude, longitude = estimate_tracking_coordinates(load)
    point = TrackingLocation(
        load=load.id,
        latitude=latitude,
        longitude=longitude,
        label="Cached tracking update",
    )
    db.session.add(point)
    db.session.commit()
    return point


def should_refresh_tracking_point(point):
    recorded_at = point.recorded_at
    if recorded_at.tzinfo is None:
        recorded_at = recorded_at.replace(tzinfo=timezone.utc)
    age = datetime.now(timezone.utc) - recorded_at
    return age.total_seconds() >= TRACKING_REFRESH_SECONDS


def estimate_tracking_coordinates(load):
    origin = resolve_place_coordinates(load.origin)
    destination = resolve_place_coordinates(load.destination)
    if not origin and not destination:
        return 30.8, -83.4
    if not origin:
        return destination
    if not destination:
        return origin

    progress = max(0, min(int(load.progress or 0), 100)) / 100
    if load.status in {"Pending Assignment", "Awaiting Driver Confirmation"}:
        progress = min(progress, 0.08)
    latitude = origin[0] + (destination[0] - origin[0]) * progress
    longitude = origin[1] + (destination[1] - origin[1]) * progress
    return round(latitude, 6), round(longitude, 6)


def resolve_place_coordinates(place):
    normalized = str(place or "").lower()
    for key, coordinates in PLACE_COORDINATES.items():
        if key in normalized:
            return coordinates
    return None


def scoped_load_query():
    query = Load.query
    if is_customer_user():
        query = query.filter(Load.customer == g.current_user.company)
    elif is_driver_user():
        query = query.filter(Load.driver == g.current_user.name)
    return query


def scoped_document_query(load_ids):
    query = Document.query
    if is_customer_user():
        query = query.filter(Document.load.in_(load_ids or ["__none__"]))
    return query


def scoped_invoice_query(load_ids):
    query = Invoice.query
    if is_customer_user():
        query = query.filter(Invoice.load.in_(load_ids or ["__none__"]))
    return query


def scoped_incident_query(load_ids):
    query = Incident.query
    if is_customer_user():
        query = query.filter(Incident.load.in_(load_ids or ["__none__"]))
    return query


def scoped_user_query():
    query = User.query
    if is_customer_user():
        query = query.filter(User.id == g.current_user.id)
    return query


def scoped_audit_messages(load_ids):
    messages = [item.to_dict() for item in AuditLog.query.order_by(AuditLog.created_at.desc()).limit(80).all()]
    if not is_customer_user():
        return messages[:20]
    return [
        message
        for message in messages
        if any(load_id and load_id in message for load_id in load_ids)
        and not is_user_admin_audit_message(message)
    ][:20]


def is_user_admin_audit_message(message):
    lowered = message.lower()
    return " user " in lowered or lowered.startswith("user ") or "updated user" in lowered or "deactivated user" in lowered


def get_upload_dir():
    upload_dir = os.path.join(os.path.dirname(__file__), "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    return upload_dir


def save_uploaded_file(uploaded_file):
    upload_dir = get_upload_dir()
    original_name = secure_filename(uploaded_file.filename or "attachment")
    stored_name = f"{uuid4().hex}_{original_name}"
    uploaded_file.save(os.path.join(upload_dir, stored_name))
    return {
        "file_name": original_name,
        "file_path": stored_name,
        "mime_type": uploaded_file.mimetype or "",
    }


def delete_uploaded_file(file_path):
    if not file_path:
        return
    upload_dir = get_upload_dir()
    target_path = os.path.abspath(os.path.join(upload_dir, file_path))
    if not target_path.startswith(os.path.abspath(upload_dir)):
        return
    if os.path.exists(target_path):
        os.remove(target_path)


def sync_load_doc_count(load):
    load.docs = Document.query.filter_by(load=load.id).count()


def ensure_document_attachment_columns():
    existing_columns = {column["name"] for column in inspect(db.engine).get_columns("documents")}
    column_definitions = {
        "file_name": "VARCHAR(255) NOT NULL DEFAULT ''",
        "file_path": "VARCHAR(255) NOT NULL DEFAULT ''",
        "mime_type": "VARCHAR(120) NOT NULL DEFAULT ''",
    }
    for column_name, definition in column_definitions.items():
        if column_name not in existing_columns:
            db.session.execute(text(f"ALTER TABLE documents ADD COLUMN {column_name} {definition}"))
    db.session.commit()


def ensure_load_route_columns():
    existing_columns = {column["name"] for column in inspect(db.engine).get_columns("loads")}
    column_definitions = {
        "route_stops": "TEXT NOT NULL DEFAULT ''",
        "route_notes": "TEXT NOT NULL DEFAULT ''",
        "route_distance": "VARCHAR(80) NOT NULL DEFAULT ''",
        "route_duration": "VARCHAR(80) NOT NULL DEFAULT ''",
        "route_geometry": "TEXT NOT NULL DEFAULT ''",
    }
    for column_name, definition in column_definitions.items():
        if column_name not in existing_columns:
            db.session.execute(text(f"ALTER TABLE loads ADD COLUMN {column_name} {definition}"))
    db.session.commit()


def parse_schedule_datetime(value, now=None):
    if not value:
        return None
    now = now or datetime.now()
    text = str(value).strip()
    for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M", "%b %d, %H:%M"):
        try:
            parsed = datetime.strptime(text, fmt)
            if fmt == "%b %d, %H:%M":
                parsed = parsed.replace(year=now.year)
            return parsed
        except ValueError:
            pass
    return None


def format_duration(delta):
    total_minutes = max(0, int((delta.total_seconds() + 59) // 60))
    days, remainder = divmod(total_minutes, 1440)
    hours, minutes = divmod(remainder, 60)
    if days:
        return f"{days}d {hours}h"
    if hours:
        return f"{hours}h {minutes}m"
    return f"{minutes}m"


def calculate_load_timing(load, now=None):
    now = now or datetime.now()
    if load.status in {"Delivered", "Completed"}:
        return {"eta": "Delivered", "progress": 100}
    if load.status == "Cancelled":
        return {"eta": "Cancelled", "progress": load.progress or 0}

    pickup = parse_schedule_datetime(load.pickup, now)
    delivery = parse_schedule_datetime(load.delivery, now)
    if not pickup or not delivery or delivery <= pickup:
        return {"eta": load.eta or "Pending", "progress": load.progress or 0}

    if now < pickup:
        return {"eta": f"Pickup in {format_duration(pickup - now)}", "progress": 0}
    if now >= delivery:
        return {"eta": "Overdue", "progress": 100}

    total_seconds = (delivery - pickup).total_seconds()
    elapsed_seconds = (now - pickup).total_seconds()
    progress = round((elapsed_seconds / total_seconds) * 100)
    return {
        "eta": format_duration(delivery - now),
        "progress": max(0, min(progress, 100)),
    }


def apply_load_timing(load):
    timing = calculate_load_timing(load)
    load.eta = timing["eta"]
    load.progress = timing["progress"]


def serialize_load(load):
    data = load.to_dict()
    data.update(calculate_load_timing(load))
    data["docs"] = Document.query.filter_by(load=load.id).count()
    return data


def list_truckers():
    driver_details = {driver.name: driver for driver in Driver.query.order_by(Driver.name).all()}
    truckers = User.query.filter(User.role_id.in_(["driver", "trucker"])).order_by(User.name).all()
    return [
        {
            "id": user.id,
            "name": user.name,
            "status": driver_details[user.name].status if user.name in driver_details else "Available",
            "location": driver_details[user.name].location if user.name in driver_details else user.company,
            "score": driver_details[user.name].score if user.name in driver_details else 95,
            "email": user.email,
            "role": user.role_id,
        }
        for user in truckers
        if user.active
    ]


app = create_app()


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=False)
