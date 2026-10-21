try:
    from .data import INITIAL_STATE, ROLE_PROFILES
    from .models import AuditLog, Document, Driver, Incident, Invoice, Load, Role, TrackingLocation, User, db
except ImportError:
    from data import INITIAL_STATE, ROLE_PROFILES
    from models import AuditLog, Document, Driver, Incident, Invoice, Load, Role, TrackingLocation, User, db


def seed_database():
    for role_id, profile in ROLE_PROFILES.items():
        role = db.session.get(Role, role_id)
        if role is None:
            db.session.add(Role(
                id=role_id,
                label=profile["label"],
                subtitle=profile["subtitle"],
                permissions=",".join(profile["permissions"]),
            ))
        else:
            role.label = profile["label"]
            role.subtitle = profile["subtitle"]
            role.permissions = ",".join(profile["permissions"])
    db.session.commit()

    for user in User.query.filter_by(role_id="manager").all():
        if not user.id.startswith("ADM-"):
            user.active = False

    legacy_demo_user_ids = ("USR-001", "USR-002", "USR-003")
    for user_id in legacy_demo_user_ids:
        user = db.session.get(User, user_id)
        if user is not None:
            user.active = False
    db.session.commit()

    for item in INITIAL_STATE["loads"]:
        if db.session.get(Load, item["id"]) is None:
            db.session.add(Load(**item))

    for item in INITIAL_STATE["drivers"]:
        if db.session.get(Driver, item["id"]) is None:
            db.session.add(Driver(**item))
    db.session.commit()

    for item in INITIAL_STATE["documents"]:
        if db.session.get(Document, item["id"]) is None:
            db.session.add(Document(**item))

    for item in INITIAL_STATE["invoices"]:
        if db.session.get(Invoice, item["id"]) is None:
            db.session.add(Invoice(**item))

    for item in INITIAL_STATE["incidents"]:
        if db.session.get(Incident, item["id"]) is None:
            db.session.add(Incident(**item))

    for load_id, points in INITIAL_STATE["tracking"].items():
        if not TrackingLocation.query.filter_by(load=load_id).first():
            for point in points:
                db.session.add(TrackingLocation(
                    load=load_id,
                    latitude=point["latitude"],
                    longitude=point["longitude"],
                    label=point["label"],
                ))

    if not AuditLog.query.first():
        for message in INITIAL_STATE["audit"]:
            db.session.add(AuditLog(message=message))

    db.session.commit()
