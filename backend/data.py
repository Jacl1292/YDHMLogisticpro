from copy import deepcopy
from datetime import datetime, timezone
from uuid import uuid4


ROLE_PROFILES = {
    "customer": {
        "label": "Cliente",
        "subtitle": "Portal para tracking, documentos, historial y facturacion.",
        "user": "Olivia Carter",
        "company": "Sunrise Foods LLC",
        "permissions": ["overview", "loads", "tracking", "documents", "invoices", "support"],
    },
    "driver": {
        "label": "Trucker",
        "subtitle": "App operativa para aceptar, recoger, entregar y reportar.",
        "user": "Michael Brown",
        "company": "YDHM Unit 18",
        "permissions": ["overview", "driver", "tracking", "documents", "incidents"],
    },
    "dispatcher": {
        "label": "Dispatcher",
        "subtitle": "Operacion diaria, asignaciones, rutas, documentos y billing.",
        "user": "Sophia Mitchell",
        "company": "YDHM Operations",
        "permissions": ["overview", "loads", "dispatch", "routes", "tracking", "documents", "invoices", "incidents"],
    },
    "manager": {
        "label": "Manager",
        "subtitle": "Vista total, usuarios, permisos, auditoria y finanzas.",
        "user": "Yanz Hinze",
        "company": "YDHM Logistics Corp.",
        "permissions": ["overview", "loads", "dispatch", "routes", "tracking", "documents", "invoices", "incidents", "users", "audit"],
    },
}

NAVIGATION = [
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
]

INITIAL_STATE = {
    "loads": [
        {
            "id": "LD-2026-00145",
            "customer": "Sunrise Foods LLC",
            "driver": "Michael Brown",
            "origin": "Miami, FL",
            "destination": "Atlanta, GA",
            "pickup": "Jul 15, 08:30",
            "delivery": "Jul 16, 14:00",
            "status": "In Transit",
            "eta": "4h 20m",
            "docs": 5,
            "invoice": "Issued",
            "rate": 3850,
            "progress": 68,
        },
        {
            "id": "LD-2026-00146",
            "customer": "Blue Harbor Retail",
            "driver": "Unassigned",
            "origin": "Tampa, FL",
            "destination": "Charlotte, NC",
            "pickup": "Jul 15, 12:00",
            "delivery": "Jul 17, 09:00",
            "status": "Pending Assignment",
            "eta": "Pending",
            "docs": 2,
            "invoice": "Draft",
            "rate": 4200,
            "progress": 12,
        },
        {
            "id": "LD-2026-00147",
            "customer": "Evergreen Medical",
            "driver": "David Wilson",
            "origin": "Orlando, FL",
            "destination": "Nashville, TN",
            "pickup": "Jul 14, 18:00",
            "delivery": "Jul 16, 11:30",
            "status": "Delayed",
            "eta": "6h 45m",
            "docs": 4,
            "invoice": "Pending POD",
            "rate": 5150,
            "progress": 52,
        },
        {
            "id": "LD-2026-00148",
            "customer": "Apex Hardware",
            "driver": "Sarah Lee",
            "origin": "Hialeah, FL",
            "destination": "Savannah, GA",
            "pickup": "Jul 13, 07:00",
            "delivery": "Jul 14, 16:20",
            "status": "Delivered",
            "eta": "Delivered",
            "docs": 7,
            "invoice": "Ready",
            "rate": 2750,
            "progress": 100,
        },
        {
            "id": "LD-2026-00140",
            "customer": "Northstar Supply",
            "driver": "James Miller",
            "origin": "Jacksonville, FL",
            "destination": "Birmingham, AL",
            "pickup": "Jul 08, 09:15",
            "delivery": "Jul 09, 17:30",
            "status": "Completed",
            "eta": "Delivered",
            "docs": 6,
            "invoice": "Paid",
            "rate": 6120,
            "progress": 100,
        },
    ],
    "documents": [
        {"id": "DOC-221", "load": "LD-2026-00145", "type": "Bill of Lading", "owner": "Michael Brown", "status": "Approved", "visibility": "Cliente"},
        {"id": "DOC-222", "load": "LD-2026-00145", "type": "Rate Confirmation", "owner": "Sophia Mitchell", "status": "Approved", "visibility": "Interno"},
        {"id": "DOC-223", "load": "LD-2026-00147", "type": "Damage Photo", "owner": "David Wilson", "status": "Review", "visibility": "Operaciones"},
        {"id": "DOC-224", "load": "LD-2026-00148", "type": "Proof of Delivery", "owner": "Sarah Lee", "status": "Missing approval", "visibility": "Cliente"},
    ],
    "invoices": [
        {"id": "INV-2026-0091", "load": "LD-2026-00145", "customer": "Sunrise Foods LLC", "total": 3850, "status": "Issued", "due": "Jul 30"},
        {"id": "INV-2026-0092", "load": "LD-2026-00148", "customer": "Apex Hardware", "total": 2750, "status": "Ready", "due": "Jul 28"},
        {"id": "INV-2026-0088", "load": "LD-2026-00140", "customer": "Northstar Supply", "total": 6120, "status": "Paid", "due": "Jul 10"},
    ],
    "drivers": [
        {"id": "DRV-18", "name": "Michael Brown", "status": "In transit", "location": "I-75 North", "score": 98},
        {"id": "DRV-22", "name": "David Wilson", "status": "Delayed", "location": "Valdosta, GA", "score": 91},
        {"id": "DRV-31", "name": "Sarah Lee", "status": "Available", "location": "Hialeah, FL", "score": 96},
        {"id": "DRV-44", "name": "James Miller", "status": "Available", "location": "Tampa, FL", "score": 93},
    ],
    "incidents": [
        {"id": "INC-501", "load": "LD-2026-00147", "type": "Delay", "priority": "High", "status": "Open", "description": "Weather and traffic delay near Valdosta, GA."},
    ],
    "users": [
        {"id": "USR-001", "name": "Olivia Carter", "email": "olivia@sunrise.example", "role": "customer", "active": True},
        {"id": "USR-002", "name": "Michael Brown", "email": "michael@ydhm.example", "role": "driver", "active": True},
        {"id": "USR-003", "name": "Sophia Mitchell", "email": "sophia@ydhm.example", "role": "dispatcher", "active": True},
        {"id": "USR-004", "name": "Yanz Hinze", "email": "manager@ydhm.example", "role": "manager", "active": True},
    ],
    "tracking": {
        "LD-2026-00145": [
            {"latitude": 25.7617, "longitude": -80.1918, "label": "Miami pickup", "recorded_at": "2026-07-15T08:40:00Z"},
            {"latitude": 29.6516, "longitude": -82.3248, "label": "Gainesville check-in", "recorded_at": "2026-07-15T14:30:00Z"},
            {"latitude": 33.7490, "longitude": -84.3880, "label": "Atlanta delivery", "recorded_at": "2026-07-16T13:55:00Z"},
        ]
    },
    "audit": [
        "Manager created role Dispatcher with loads.assign permission.",
        "Sophia assigned LD-2026-00145 to Michael Brown.",
        "Michael confirmed pickup at Miami, FL with GPS evidence.",
        "David reported delay on LD-2026-00147.",
        "Sarah uploaded POD for LD-2026-00148.",
    ],
}


class LogisticsRepository:
    def __init__(self):
        self.state = deepcopy(INITIAL_STATE)

    def bootstrap(self):
        return {
            "roles": ROLE_PROFILES,
            "navigation": NAVIGATION,
            **deepcopy(self.state),
        }

    def list_items(self, collection):
        return deepcopy(self.state[collection])

    def find_item(self, collection, item_id):
        for item in self.state[collection]:
            if item["id"] == item_id:
                return item
        return None

    def create_item(self, collection, data):
        item = dict(data)
        item.setdefault("id", self._next_id(collection))
        self.state[collection].append(item)
        self.add_audit(f"Created {collection[:-1]} {item['id']}.")
        return deepcopy(item)

    def update_item(self, collection, item_id, changes):
        item = self.find_item(collection, item_id)
        if item is None:
            return None
        item.update(changes)
        self.add_audit(f"Updated {collection[:-1]} {item_id}.")
        return deepcopy(item)

    def assign_load(self, load_id, driver_name):
        load = self.find_item("loads", load_id)
        if load is None:
            return None
        load.update({
            "driver": driver_name,
            "status": "Awaiting Driver Confirmation",
            "progress": max(load.get("progress", 0), 18),
        })
        self.add_audit(f"{load_id} assigned to {driver_name}.")
        return deepcopy(load)

    def change_load_status(self, load_id, status, progress=None, eta=None):
        load = self.find_item("loads", load_id)
        if load is None:
            return None
        load["status"] = status
        if progress is not None:
            load["progress"] = progress
        if eta is not None:
            load["eta"] = eta
        self.add_audit(f"{load_id} changed status to {status}.")
        return deepcopy(load)

    def approve_document(self, document_id, approved_by):
        document = self.find_item("documents", document_id)
        if document is None:
            return None
        document["status"] = "Approved"
        self.add_audit(f"Document {document_id} approved by {approved_by}.")
        return deepcopy(document)

    def issue_invoice(self, invoice_id):
        invoice = self.find_item("invoices", invoice_id)
        if invoice is None:
            return None
        invoice["status"] = "Issued"
        self.add_audit(f"Invoice {invoice_id} issued to customer portal.")
        return deepcopy(invoice)

    def resolve_incident(self, incident_id):
        incident = self.find_item("incidents", incident_id)
        if incident is None:
            return None
        incident["status"] = "Resolved"
        incident["resolved_at"] = utc_now()
        self.add_audit(f"Incident {incident_id} resolved.")
        return deepcopy(incident)

    def add_audit(self, message):
        self.state["audit"].insert(0, message)
        self.state["audit"] = self.state["audit"][:20]

    def _next_id(self, collection):
        prefix = {
            "loads": "LD-2026",
            "documents": "DOC",
            "invoices": "INV-2026",
            "incidents": "INC",
            "users": "USR",
        }.get(collection, "ID")
        return f"{prefix}-{str(uuid4())[:8].upper()}"


def utc_now():
    return datetime.now(timezone.utc).isoformat()
