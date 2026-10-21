from datetime import datetime, timezone
from uuid import uuid4

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from werkzeug.security import check_password_hash, generate_password_hash


db = SQLAlchemy()


def new_id(prefix):
    return f"{prefix}-{str(uuid4())[:8].upper()}"


def now_utc():
    return datetime.now(timezone.utc)


class Role(db.Model):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    label: Mapped[str] = mapped_column(String(80), nullable=False)
    subtitle: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    permissions: Mapped[str] = mapped_column(Text, nullable=False, default="")

    users = relationship("User", back_populates="role")

    def permission_list(self):
        return [item for item in self.permissions.split(",") if item]

    def to_dashboard(self):
        first_user = self.users[0] if self.users else None
        return {
            "label": self.label,
            "subtitle": self.subtitle,
            "user": first_user.name if first_user else self.label,
            "company": first_user.company if first_user else "YDHM Logistics Corp.",
            "permissions": self.permission_list(),
        }


class User(db.Model):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("USR"))
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    company: Mapped[str] = mapped_column(String(160), nullable=False, default="YDHM Logistics Corp.")
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    role_id: Mapped[str] = mapped_column(ForeignKey("roles.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=now_utc)

    role = relationship("Role", back_populates="users")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "company": self.company,
            "role": self.role_id,
            "permissions": self.role.permission_list() if self.role else [],
            "active": self.active,
        }


class Driver(db.Model):
    __tablename__ = "drivers"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(80), nullable=False, default="Available")
    location: Mapped[str] = mapped_column(String(160), nullable=False, default="")
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=95)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "status": self.status, "location": self.location, "score": self.score}


class Load(db.Model):
    __tablename__ = "loads"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("LD-2026"))
    customer: Mapped[str] = mapped_column(String(160), nullable=False)
    driver: Mapped[str] = mapped_column(String(120), nullable=False, default="Unassigned")
    origin: Mapped[str] = mapped_column(String(160), nullable=False)
    destination: Mapped[str] = mapped_column(String(160), nullable=False)
    pickup: Mapped[str] = mapped_column(String(80), nullable=False)
    delivery: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(80), nullable=False, default="Pending Assignment")
    eta: Mapped[str] = mapped_column(String(80), nullable=False, default="Pending")
    docs: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    invoice: Mapped[str] = mapped_column(String(80), nullable=False, default="Draft")
    rate: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    progress: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    route_stops: Mapped[str] = mapped_column(Text, nullable=False, default="")
    route_notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    route_distance: Mapped[str] = mapped_column(String(80), nullable=False, default="")
    route_duration: Mapped[str] = mapped_column(String(80), nullable=False, default="")
    route_geometry: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=now_utc)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=now_utc, onupdate=now_utc)

    def to_dict(self):
        return {
            "id": self.id,
            "customer": self.customer,
            "driver": self.driver,
            "origin": self.origin,
            "destination": self.destination,
            "pickup": self.pickup,
            "delivery": self.delivery,
            "status": self.status,
            "eta": self.eta,
            "docs": self.docs,
            "invoice": self.invoice,
            "rate": self.rate,
            "progress": self.progress,
            "route_stops": self.route_stops,
            "route_notes": self.route_notes,
            "route_distance": self.route_distance,
            "route_duration": self.route_duration,
            "route_geometry": self.route_geometry,
        }


class Document(db.Model):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("DOC"))
    load: Mapped[str] = mapped_column(String(40), ForeignKey("loads.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(120), nullable=False)
    owner: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(80), nullable=False, default="Review")
    visibility: Mapped[str] = mapped_column(String(80), nullable=False, default="Operaciones")
    file_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    file_path: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    mime_type: Mapped[str] = mapped_column(String(120), nullable=False, default="")

    def to_dict(self):
        return {
            "id": self.id,
            "load": self.load,
            "type": self.type,
            "owner": self.owner,
            "status": self.status,
            "visibility": self.visibility,
            "file_name": self.file_name,
            "file_url": f"/api/documents/{self.id}/file" if self.file_path else "",
            "mime_type": self.mime_type,
        }


class Invoice(db.Model):
    __tablename__ = "invoices"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("INV-2026"))
    load: Mapped[str] = mapped_column(String(40), ForeignKey("loads.id"), nullable=False)
    customer: Mapped[str] = mapped_column(String(160), nullable=False)
    total: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(80), nullable=False, default="Draft")
    due: Mapped[str] = mapped_column(String(80), nullable=False, default="")

    def to_dict(self):
        return {"id": self.id, "load": self.load, "customer": self.customer, "total": self.total, "status": self.status, "due": self.due}


class Incident(db.Model):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("INC"))
    load: Mapped[str] = mapped_column(String(40), ForeignKey("loads.id"), nullable=False)
    type: Mapped[str] = mapped_column(String(80), nullable=False, default="Other")
    priority: Mapped[str] = mapped_column(String(80), nullable=False, default="Medium")
    status: Mapped[str] = mapped_column(String(80), nullable=False, default="Open")
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "load": self.load,
            "type": self.type,
            "priority": self.priority,
            "status": self.status,
            "description": self.description,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }


class TrackingLocation(db.Model):
    __tablename__ = "tracking_locations"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("TRK"))
    load: Mapped[str] = mapped_column(String(40), ForeignKey("loads.id"), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    label: Mapped[str] = mapped_column(String(160), nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=now_utc)

    def to_dict(self):
        return {
            "id": self.id,
            "load": self.load,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "label": self.label,
            "recorded_at": self.recorded_at.isoformat(),
        }


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, default=lambda: new_id("AUD"))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=now_utc)

    def to_dict(self):
        return self.message
