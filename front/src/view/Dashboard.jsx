import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faChartLine,
  faCircleCheck,
  faClockRotateLeft,
  faFileInvoiceDollar,
  faFileLines,
  faLocationDot,
  faMapLocationDot,
  faRoute,
  faShieldHalved,
  faTriangleExclamation,
  faTruckFast,
  faUserGear,
  faUsers,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import "../css/dashboard.css";
import { logisticsApi } from "../services/logisticsApi";
import useAuth from "../hooks/useAuth";

const roleProfiles = {
  customer: {
    label: "Cliente",
    subtitle: "Portal para tracking, documentos, historial y facturacion.",
    user: "Olivia Carter",
    company: "Sunrise Foods LLC",
    permissions: ["overview", "loads", "tracking", "documents", "invoices", "support"],
  },
  driver: {
    label: "Trucker",
    subtitle: "App operativa para aceptar, recoger, entregar y reportar.",
    user: "Michael Brown",
    company: "YDHM Unit 18",
    permissions: ["overview", "driver", "tracking", "documents", "incidents"],
  },
  dispatcher: {
    label: "Dispatcher",
    subtitle: "Operacion diaria, asignaciones, rutas, documentos y billing.",
    user: "Sophia Mitchell",
    company: "YDHM Operations",
    permissions: ["overview", "loads", "dispatch", "routes", "tracking", "documents", "invoices", "incidents"],
  },
  manager: {
    label: "Manager",
    subtitle: "Vista total, usuarios, permisos, auditoria y finanzas.",
    user: "Yanz Hinze",
    company: "YDHM Logistics Corp.",
    permissions: ["overview", "loads", "dispatch", "routes", "tracking", "documents", "invoices", "incidents", "users", "audit"],
  },
};

const navigation = [
  { id: "overview", label: "Dashboard", icon: faChartLine },
  { id: "loads", label: "Cargas", icon: faBoxesStacked },
  { id: "dispatch", label: "Dispatch", icon: faTruckFast },
  { id: "routes", label: "Rutas", icon: faRoute },
  { id: "driver", label: "Driver app", icon: faRoute },
  { id: "tracking", label: "Tracking", icon: faMapLocationDot },
  { id: "documents", label: "Adjuntos", icon: faFileLines },
  { id: "invoices", label: "Facturacion", icon: faFileInvoiceDollar },
  { id: "incidents", label: "Incidencias", icon: faTriangleExclamation },
  { id: "users", label: "Usuarios", icon: faUsers },
  { id: "audit", label: "Auditoria", icon: faShieldHalved },
  { id: "support", label: "Soporte", icon: faUserGear },
];

const initialLoads = [
  {
    id: "LD-2026-00145",
    customer: "Sunrise Foods LLC",
    driver: "Michael Brown",
    origin: "Miami, FL",
    destination: "Atlanta, GA",
    pickup: "Jul 15, 08:30",
    delivery: "Jul 16, 14:00",
    status: "In Transit",
    eta: "4h 20m",
    docs: 5,
    invoice: "Issued",
    rate: 3850,
    progress: 68,
  },
  {
    id: "LD-2026-00146",
    customer: "Blue Harbor Retail",
    driver: "Unassigned",
    origin: "Tampa, FL",
    destination: "Charlotte, NC",
    pickup: "Jul 15, 12:00",
    delivery: "Jul 17, 09:00",
    status: "Pending Assignment",
    eta: "Pending",
    docs: 2,
    invoice: "Draft",
    rate: 4200,
    progress: 12,
  },
  {
    id: "LD-2026-00147",
    customer: "Evergreen Medical",
    driver: "David Wilson",
    origin: "Orlando, FL",
    destination: "Nashville, TN",
    pickup: "Jul 14, 18:00",
    delivery: "Jul 16, 11:30",
    status: "Delayed",
    eta: "6h 45m",
    docs: 4,
    invoice: "Pending POD",
    rate: 5150,
    progress: 52,
  },
  {
    id: "LD-2026-00148",
    customer: "Apex Hardware",
    driver: "Sarah Lee",
    origin: "Hialeah, FL",
    destination: "Savannah, GA",
    pickup: "Jul 13, 07:00",
    delivery: "Jul 14, 16:20",
    status: "Delivered",
    eta: "Delivered",
    docs: 7,
    invoice: "Ready",
    rate: 2750,
    progress: 100,
  },
];

const initialDocuments = [
  { id: "DOC-221", load: "LD-2026-00145", type: "Bill of Lading", owner: "Michael Brown", status: "Approved", visibility: "Cliente" },
  { id: "DOC-222", load: "LD-2026-00145", type: "Rate Confirmation", owner: "Sophia Mitchell", status: "Approved", visibility: "Interno" },
  { id: "DOC-223", load: "LD-2026-00147", type: "Damage Photo", owner: "David Wilson", status: "Review", visibility: "Operaciones" },
  { id: "DOC-224", load: "LD-2026-00148", type: "Proof of Delivery", owner: "Sarah Lee", status: "Missing approval", visibility: "Cliente" },
];

const initialInvoices = [
  { id: "INV-2026-0091", load: "LD-2026-00145", customer: "Sunrise Foods LLC", total: 3850, status: "Issued", due: "Jul 30" },
  { id: "INV-2026-0092", load: "LD-2026-00148", customer: "Apex Hardware", total: 2750, status: "Ready", due: "Jul 28" },
  { id: "INV-2026-0088", load: "LD-2026-00140", customer: "Northstar Supply", total: 6120, status: "Paid", due: "Jul 10" },
];

const auditTrail = [
  "Manager created role Dispatcher with loads.assign permission.",
  "Sophia assigned LD-2026-00145 to Michael Brown.",
  "Michael confirmed pickup at Miami, FL with GPS evidence.",
  "David reported delay on LD-2026-00147.",
  "Sarah uploaded POD for LD-2026-00148.",
];

const initialDrivers = [
  { name: "Michael Brown", status: "In transit", location: "I-75 North", score: 98 },
  { name: "David Wilson", status: "Delayed", location: "Valdosta, GA", score: 91 },
  { name: "Sarah Lee", status: "Available", location: "Hialeah, FL", score: 96 },
  { name: "James Miller", status: "Available", location: "Tampa, FL", score: 93 },
];

const initialIncidents = [
  { id: "INC-501", load: "LD-2026-00147", type: "Delay", priority: "High", status: "Open", description: "Weather and traffic delay near Valdosta, GA." },
];

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const statusClass = (status) => status.toLowerCase().replaceAll(" ", "-");

const monthMap = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

const parseScheduleDate = (value, now = new Date()) => {
  if (!value) return null;
  const scheduled = String(value).trim();
  const match = scheduled.match(/^([A-Za-z]{3,})\s+(\d{1,2}),\s*(\d{1,2}):(\d{2})$/);
  if (match) {
    const [, monthName, day, hour, minute] = match;
    const month = monthMap[monthName.slice(0, 3).toLowerCase()];
    if (month === undefined) return null;
    return new Date(now.getFullYear(), month, Number(day), Number(hour), Number(minute));
  }
  const parsed = new Date(scheduled);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDuration = (milliseconds) => {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const calculateLoadTiming = (load, now = new Date()) => {
  if (load.status === "Delivered" || load.status === "Completed") {
    return { eta: "Delivered", progress: 100 };
  }
  if (load.status === "Cancelled") {
    return { eta: "Cancelled", progress: load.progress ?? 0 };
  }

  const pickupDate = parseScheduleDate(load.pickup, now);
  const deliveryDate = parseScheduleDate(load.delivery, now);
  if (!pickupDate || !deliveryDate || deliveryDate <= pickupDate) {
    return { eta: load.eta || "Pending", progress: load.progress ?? 0 };
  }

  if (now < pickupDate) {
    return { eta: `Pickup in ${formatDuration(pickupDate - now)}`, progress: 0 };
  }

  if (now >= deliveryDate) {
    return { eta: "Overdue", progress: 100 };
  }

  const totalMs = deliveryDate - pickupDate;
  const elapsedMs = now - pickupDate;
  return {
    eta: formatDuration(deliveryDate - now),
    progress: Math.max(0, Math.min(Math.round((elapsedMs / totalMs) * 100), 100)),
  };
};

const withCalculatedTiming = (load, now = new Date()) => ({
  ...load,
  ...calculateLoadTiming(load, now),
});

const withDocumentCounts = (loads, documents) => {
  const counts = documents.reduce((items, document) => {
    items[document.load] = (items[document.load] || 0) + 1;
    return items;
  }, {});
  return loads.map((load) => ({ ...load, docs: counts[load.id] || 0 }));
};

const splitRouteStops = (value) =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const estimateRoutePlan = (load, stops = []) => {
  const stopCount = stops.length;
  const distance = Math.max(90, 280 + stopCount * 42 + (load.id || "").length * 3);
  const hours = Math.max(2, Math.round((distance / 58 + stopCount * 0.6) * 10) / 10);
  return {
    route_distance: `${distance} mi`,
    route_duration: `${hours} h`,
  };
};

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

const formatMiles = (meters) => `${Math.round((meters / 1609.344) * 10) / 10} mi`;

const formatRouteHours = (seconds) => {
  const minutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) return `${hours}h ${remainingMinutes}m`;
  return `${remainingMinutes}m`;
};

const buildGoogleMapsDirectionsUrl = (points) => {
  const cleanPoints = points.map((point) => String(point || "").trim()).filter(Boolean);
  if (cleanPoints.length < 2) return "";
  const origin = encodeURIComponent(cleanPoints[0]);
  const destination = encodeURIComponent(cleanPoints[cleanPoints.length - 1]);
  const waypoints = cleanPoints.slice(1, -1).map(encodeURIComponent).join("|");
  const waypointParam = waypoints ? `&waypoints=${waypoints}` : "";
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypointParam}&travelmode=driving`;
};

const geocodeMapboxPlace = async (place, signal) => {
  const query = encodeURIComponent(place);
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?country=us&limit=1&access_token=${mapboxToken}`,
    { signal },
  );
  if (!response.ok) throw new Error("No se pudo geocodificar la ubicacion.");
  const data = await response.json();
  const feature = data.features?.[0];
  if (!feature?.center) throw new Error(`Mapbox no encontro coordenadas para ${place}.`);
  return feature.center;
};

const fetchMapboxRoute = async (points, signal) => {
  if (!mapboxToken) throw new Error("Falta VITE_MAPBOX_TOKEN.");
  const coordinates = await Promise.all(points.map((point) => geocodeMapboxPlace(point, signal)));
  const coordinatePath = coordinates.map(([lng, lat]) => `${lng},${lat}`).join(";");
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordinatePath}?alternatives=true&geometries=geojson&overview=full&steps=true&access_token=${mapboxToken}`,
    { signal },
  );
  if (!response.ok) throw new Error("No se pudo calcular la ruta en Mapbox.");
  const data = await response.json();
  const routes = data.routes || [];
  if (!routes.length) throw new Error("Mapbox no devolvio una ruta valida.");
  return {
    coordinates,
    routes: routes.map((route, index) => ({
      id: `route-${index}`,
      label: index === 0 ? "Mas rapida" : `Alternativa ${index + 1}`,
      geometry: route.geometry,
      distance: formatMiles(route.distance),
      duration: formatRouteHours(route.duration),
      rawDistance: route.distance,
      rawDuration: route.duration,
    })),
  };
};

const isUserAdminActivity = (message) => {
  const normalized = message.toLowerCase();
  return normalized.includes(" user ") || normalized.startsWith("user ") || normalized.includes("updated user") || normalized.includes("deactivated user");
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState(roleProfiles);
  const [role, setRole] = useState(user?.role && roleProfiles[user.role] ? user.role : "customer");
  const [activeSection, setActiveSection] = useState("overview");
  const [loads, setLoads] = useState(initialLoads);
  const [documents, setDocuments] = useState(initialDocuments);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [drivers, setDrivers] = useState(initialDrivers);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [users, setUsers] = useState([]);
  const [selectedLoadId, setSelectedLoadId] = useState(initialLoads[0].id);
  const [activity, setActivity] = useState(auditTrail);
  const [apiStatus, setApiStatus] = useState("connecting");
  const [nowTick, setNowTick] = useState(() => new Date());

  useEffect(() => {
    let isMounted = true;

    logisticsApi.getBootstrap()
      .then((data) => {
        if (!isMounted) return;
        setProfiles(data.roles || roleProfiles);
        setLoads(data.loads || initialLoads);
        setDocuments(data.documents || initialDocuments);
        setInvoices(data.invoices || initialInvoices);
        setDrivers(data.drivers || initialDrivers);
        setIncidents(data.incidents || initialIncidents);
        setUsers(data.users || []);
        setActivity(data.audit || auditTrail);
        setApiStatus("connected");
      })
      .catch(() => {
        if (!isMounted) return;
        setApiStatus("offline");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.role && profiles[user.role]) {
      setRole(user.role);
      const nextPermissions = profiles[user.role].permissions;
      if (!nextPermissions.includes(activeSection)) {
        setActiveSection(nextPermissions[0]);
      }
    }
  }, [user, profiles, activeSection]);

  const profile = profiles[role] || roleProfiles.customer;
  const availableNav = navigation.filter((item) => profile.permissions.includes(item.id));
  const isCustomerRole = role === "customer";
  const isDriverRole = ["driver", "trucker"].includes(role);
  const customerCompany = user?.company || profile.company;
  const driverName = user?.name || profile.user;
  const scopedLoads = useMemo(
    () => {
      if (isCustomerRole) return loads.filter((load) => load.customer === customerCompany);
      if (isDriverRole) return loads.filter((load) => load.driver === driverName);
      return loads;
    },
    [isCustomerRole, isDriverRole, loads, customerCompany, driverName],
  );
  const scopedLoadIds = useMemo(() => new Set(scopedLoads.map((load) => load.id)), [scopedLoads]);
  const scopedDocuments = useMemo(
    () => (isCustomerRole || isDriverRole ? documents.filter((document) => scopedLoadIds.has(document.load)) : documents),
    [isCustomerRole, isDriverRole, documents, scopedLoadIds],
  );
  const scopedInvoices = useMemo(
    () => (isCustomerRole || isDriverRole ? invoices.filter((invoice) => scopedLoadIds.has(invoice.load) || invoice.customer === customerCompany) : invoices),
    [isCustomerRole, isDriverRole, invoices, scopedLoadIds, customerCompany],
  );
  const scopedIncidents = useMemo(
    () => (isCustomerRole || isDriverRole ? incidents.filter((incident) => scopedLoadIds.has(incident.load)) : incidents),
    [isCustomerRole, isDriverRole, incidents, scopedLoadIds],
  );
  const scopedActivity = useMemo(() => {
    if (!isCustomerRole && !isDriverRole) return activity;
    return activity.filter((message) => (
      [...scopedLoadIds].some((loadId) => message.includes(loadId)) && !isUserAdminActivity(message)
    ));
  }, [activity, isCustomerRole, isDriverRole, scopedLoadIds]);
  const calculatedLoads = useMemo(
    () => withDocumentCounts(scopedLoads.map((load) => withCalculatedTiming(load, nowTick)), scopedDocuments),
    [scopedLoads, scopedDocuments, nowTick],
  );
  const selectedLoad = calculatedLoads.find((load) => load.id === selectedLoadId) || calculatedLoads[0];

  useEffect(() => {
    if (calculatedLoads.length && !calculatedLoads.some((load) => load.id === selectedLoadId)) {
      setSelectedLoadId(calculatedLoads[0].id);
    }
  }, [calculatedLoads, selectedLoadId]);

  const metrics = useMemo(() => {
    const activeLoads = calculatedLoads.filter((load) => !["Delivered", "Completed", "Cancelled"].includes(load.status)).length;
    const revenueSource = scopedInvoices.length ? scopedInvoices : calculatedLoads.map((load) => ({ total: load.rate }));
    const revenue = revenueSource.reduce((total, item) => total + Number(item.total || 0), 0);
    const openIssues = scopedIncidents.filter((incident) => incident.status !== "Resolved").length;
    const docReviews = scopedDocuments.filter((document) => document.status !== "Approved").length;
    return { activeLoads, revenue, openIssues, docReviews };
  }, [calculatedLoads, scopedDocuments, scopedIncidents, scopedInvoices]);

  const recordActivity = (message) => {
    setActivity((items) => [message, ...items].slice(0, 8));
  };

  const createUser = async (payload) => {
    const createdUser = await logisticsApi.createUser(payload);
    setUsers((items) => [...items, createdUser]);
    setApiStatus("connected");
    recordActivity(`Manager created user ${createdUser.email} as ${profiles[createdUser.role]?.label || createdUser.role}.`);
    return createdUser;
  };

  const updateUser = async (id, payload) => {
    const updatedUser = await logisticsApi.updateUser(id, payload);
    setUsers((items) => items.map((item) => (item.id === id ? updatedUser : item)));
    setApiStatus("connected");
    recordActivity(`Manager updated user ${updatedUser.email}.`);
    return updatedUser;
  };

  const deleteUser = async (id) => {
    const updatedUser = await logisticsApi.deleteUser(id);
    setUsers((items) => items.map((item) => (item.id === id ? updatedUser : item)));
    setApiStatus("connected");
    recordActivity(`Manager deactivated user ${updatedUser.email}.`);
    return updatedUser;
  };

  const createLoad = async (payload) => {
    try {
      const createdLoad = await logisticsApi.createLoad(payload);
      setLoads((items) => [createdLoad, ...items]);
      setSelectedLoadId(createdLoad.id);
      setApiStatus("connected");
      recordActivity(`Created load ${createdLoad.id}.`);
      return createdLoad;
    } catch (error) {
      setApiStatus("offline");
      const fallbackLoad = {
        id: `LD-LOCAL-${Date.now().toString().slice(-6)}`,
        ...payload,
        ...calculateLoadTiming(payload),
      };
      setLoads((items) => [fallbackLoad, ...items]);
      setSelectedLoadId(fallbackLoad.id);
      recordActivity(`Created load ${fallbackLoad.id} locally while API is offline.`);
      return fallbackLoad;
    }
  };

  const updateLoad = async (id, changes, message) => {
    let nextLoad = null;
    try {
      const updatedLoad = await logisticsApi.updateLoad(id, changes);
      nextLoad = updatedLoad;
      setLoads((items) => items.map((item) => (item.id === id ? updatedLoad : item)));
      setApiStatus("connected");
    } catch {
      setApiStatus("offline");
      setLoads((items) => items.map((item) => {
        if (item.id !== id) return item;
        nextLoad = withCalculatedTiming({ ...item, ...changes });
        return nextLoad;
      }));
    }
    recordActivity(message);
    return nextLoad;
  };

  const assignLoad = async (id, driverName) => {
    const previousLoad = loads.find((item) => item.id === id);
    const fallbackStatus = "Awaiting Driver Confirmation";
    try {
      const updatedLoad = await logisticsApi.assignLoad(id, driverName);
      setLoads((items) => items.map((item) => (item.id === id ? updatedLoad : item)));
      setApiStatus("connected");
      recordActivity(`${id} assigned to ${driverName}.`);
      return updatedLoad;
    } catch (error) {
      setApiStatus("offline");
      const fallbackLoad = {
        ...previousLoad,
        driver: driverName,
        status: fallbackStatus,
      };
      Object.assign(fallbackLoad, calculateLoadTiming(fallbackLoad));
      setLoads((items) => items.map((item) => (item.id === id ? fallbackLoad : item)));
      recordActivity(`${id} assigned to ${driverName} locally while API is offline.`);
      return fallbackLoad;
    }
  };

  const approveDocument = async (id) => {
    try {
      const updatedDocument = await logisticsApi.approveDocument(id, profile.label);
      setDocuments((items) => items.map((item) => (item.id === id ? updatedDocument : item)));
      setApiStatus("connected");
    } catch {
      setApiStatus("offline");
      setDocuments((items) => items.map((item) => (item.id === id ? { ...item, status: "Approved" } : item)));
    }
    recordActivity(`Document ${id} approved by ${profile.label}.`);
  };

  const createDocument = async (payload) => {
    try {
      const createdDocument = await logisticsApi.createDocument(payload);
      setDocuments((items) => [...items, createdDocument]);
      setApiStatus("connected");
      recordActivity(`Document ${createdDocument.id} uploaded for ${createdDocument.load}.`);
      return createdDocument;
    } catch (error) {
      setApiStatus("offline");
      const fallbackDocument = {
        id: `DOC-LOCAL-${Date.now().toString().slice(-6)}`,
        owner: user?.name || profile.user,
        status: "Review",
        visibility: "Operaciones",
        file_name: payload.file?.name || "",
        file_url: "",
        mime_type: payload.file?.type || "",
        ...payload,
        file: undefined,
      };
      setDocuments((items) => [...items, fallbackDocument]);
      recordActivity(`Document ${fallbackDocument.id} uploaded locally for ${fallbackDocument.load}.`);
      return fallbackDocument;
    }
  };

  const deleteDocument = async (id) => {
    const currentDocument = documents.find((document) => document.id === id);
    try {
      await logisticsApi.deleteDocument(id);
      setDocuments((items) => items.filter((item) => item.id !== id));
      setApiStatus("connected");
    } catch {
      setApiStatus("offline");
      setDocuments((items) => items.filter((item) => item.id !== id));
    }
    if (currentDocument) {
      recordActivity(`Document ${currentDocument.id} deleted from ${currentDocument.load}.`);
    }
  };

  const issueInvoice = async (id) => {
    try {
      const updatedInvoice = await logisticsApi.issueInvoice(id);
      setInvoices((items) => items.map((item) => (item.id === id ? updatedInvoice : item)));
      setApiStatus("connected");
    } catch {
      setApiStatus("offline");
      setInvoices((items) => items.map((item) => (item.id === id ? { ...item, status: "Issued" } : item)));
    }
    recordActivity(`Invoice ${id} issued to customer portal.`);
  };

  const createIncident = async (payload) => {
    try {
      const createdIncident = await logisticsApi.createIncident(payload);
      setIncidents((items) => [createdIncident, ...items]);
      setApiStatus("connected");
      recordActivity(`Incident ${createdIncident.id} reported for ${createdIncident.load}.`);
      return createdIncident;
    } catch (error) {
      setApiStatus("offline");
      const fallbackIncident = {
        id: `INC-LOCAL-${Date.now().toString().slice(-6)}`,
        status: "Open",
        resolved_at: null,
        ...payload,
      };
      setIncidents((items) => [fallbackIncident, ...items]);
      recordActivity(`Incident ${fallbackIncident.id} created locally for ${fallbackIncident.load}.`);
      return fallbackIncident;
    }
  };

  const resolveIncident = async (id) => {
    try {
      const updatedIncident = await logisticsApi.resolveIncident(id);
      setIncidents((items) => items.map((item) => (item.id === id ? updatedIncident : item)));
      setApiStatus("connected");
    } catch {
      setApiStatus("offline");
      setIncidents((items) => items.map((item) => (
        item.id === id ? { ...item, status: "Resolved", resolved_at: new Date().toISOString() } : item
      )));
    }
    recordActivity(`Incident ${id} resolved.`);
  };

  const createInvoice = async (payload) => {
    try {
      const createdInvoice = await logisticsApi.createInvoice(payload);
      setInvoices((items) => [createdInvoice, ...items]);
      setApiStatus("connected");
      recordActivity(`Invoice ${createdInvoice.id} created for ${createdInvoice.load}.`);
      return createdInvoice;
    } catch (error) {
      setApiStatus("offline");
      const load = calculatedLoads.find((item) => item.id === payload.load);
      const fallbackInvoice = {
        id: `INV-LOCAL-${Date.now().toString().slice(-6)}`,
        load: payload.load,
        customer: load?.customer || "Customer",
        total: Number(payload.total ?? load?.rate ?? 0),
        status: payload.status || "Ready",
        due: payload.due || "",
      };
      setInvoices((items) => [fallbackInvoice, ...items]);
      recordActivity(`Invoice ${fallbackInvoice.id} created locally for ${fallbackInvoice.load}.`);
      return fallbackInvoice;
    }
  };

  return (
    <main className="logistics-dashboard">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-brand" to="/">
          <img src={new URL("../images/YDHMlogo-removebg-preview.png", import.meta.url).href} alt="YDHM" />
          <div>
            <strong>YDHM</strong>
            <span>Logistics</span>
          </div>
        </Link>

        <nav className="dashboard-nav" aria-label="Dashboard sections">
          {availableNav.map((item) => (
            <button
              className={activeSection === item.id ? "active" : ""}
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
            >
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-card">
          <span className="eyebrow">Rol activo</span>
          <strong>{profile.label}</strong>
          <p>{profile.subtitle}</p>
        </div>
      </aside>

      <section className="dashboard-shell">
        <header className="dashboard-topbar">
          <div>
            <span className="eyebrow">Logistics command center</span>
            <h1>{activeSectionLabel(activeSection)}</h1>
          </div>
          <div className="operator-chip">
            <span className={`api-status ${apiStatus}`}>{apiStatus === "connected" ? "API connected" : apiStatus === "offline" ? "Mock fallback" : "Connecting API"}</span>
            <span>{user?.name || profile.user}</span>
            <strong>{user?.company || profile.company}</strong>
          </div>
        </header>

        {activeSection === "overview" && (
          <Overview metrics={metrics} loads={calculatedLoads} activity={scopedActivity} selectedLoad={selectedLoad} setSelectedLoadId={setSelectedLoadId} />
        )}

        {activeSection === "loads" && (
          <LoadsPanel
            loads={calculatedLoads}
            selectedLoadId={selectedLoadId}
            setSelectedLoadId={setSelectedLoadId}
            createLoad={createLoad}
            updateLoad={updateLoad}
            canManageLoads={["dispatcher", "manager"].includes(role)}
          />
        )}

        {activeSection === "dispatch" && (
          <DispatchPanel loads={calculatedLoads} drivers={drivers} assignLoad={assignLoad} />
        )}

        {activeSection === "routes" && (
          <RoutePlannerPanel
            loads={calculatedLoads}
            selectedLoadId={selectedLoadId}
            setSelectedLoadId={setSelectedLoadId}
            updateLoad={updateLoad}
          />
        )}

        {activeSection === "driver" && (
          selectedLoad ? <DriverPanel selectedLoad={selectedLoad} updateLoad={updateLoad} /> : <EmptyLoadsPanel />
        )}

        {activeSection === "tracking" && (
          selectedLoad ? <TrackingPanel selectedLoad={selectedLoad} loads={calculatedLoads} setSelectedLoadId={setSelectedLoadId} /> : <EmptyLoadsPanel />
        )}

        {activeSection === "documents" && (
          <DocumentsPanel
            documents={scopedDocuments}
            loads={calculatedLoads}
            createDocument={createDocument}
            deleteDocument={deleteDocument}
            approveDocument={approveDocument}
            role={role}
            currentUserName={user?.name || profile.user}
          />
        )}

        {activeSection === "invoices" && (
          <InvoicesPanel
            invoices={scopedInvoices}
            loads={calculatedLoads}
            createInvoice={createInvoice}
            issueInvoice={issueInvoice}
            role={role}
          />
        )}

        {activeSection === "incidents" && (
          <IncidentsPanel
            loads={calculatedLoads}
            incidents={scopedIncidents}
            createIncident={createIncident}
            resolveIncident={resolveIncident}
            role={role}
          />
        )}

        {activeSection === "users" && (
          <UsersPanel
            profiles={profiles}
            users={users}
            loads={calculatedLoads}
            createUser={createUser}
            updateUser={updateUser}
            deleteUser={deleteUser}
          />
        )}

        {activeSection === "audit" && <AuditPanel activity={scopedActivity} />}

        {activeSection === "support" && <SupportPanel />}
      </section>
    </main>
  );
};

const activeSectionLabel = (section) => {
  const item = navigation.find((navItem) => navItem.id === section);
  return item ? item.label : "Dashboard";
};

const Overview = ({ metrics, loads, activity, selectedLoad, setSelectedLoadId }) => (
  <div className="dashboard-grid">
    <section className="kpi-row">
      <KpiCard icon={faTruckFast} label="Cargas activas" value={metrics.activeLoads} trend="+12% semana" />
      <KpiCard icon={faFileInvoiceDollar} label="Revenue pipeline" value={formatMoney(metrics.revenue)} trend="Facturas/cargas reales" />
      <KpiCard icon={faTriangleExclamation} label="Incidencias abiertas" value={metrics.openIssues} trend="Prioridad alta" />
      <KpiCard icon={faFileLines} label="Adjuntos por revisar" value={metrics.docReviews} trend="Docs/fotos/imagenes" />
    </section>

    <section className="panel panel-wide">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Live operations</span>
          <h2>Cargas y trayectoria</h2>
        </div>
        <span className="badge-soft">US Southeast lane</span>
      </div>
      {selectedLoad ? (
        <>
          <div className="route-card">
            <LoadTrackingMap selectedLoad={selectedLoad} compact />
            <div className="route-detail">
              <strong>{selectedLoad.id}</strong>
              <p>{selectedLoad.origin} to {selectedLoad.destination}</p>
              <div className="progress-track">
                <span style={{ width: `${selectedLoad.progress}%` }} />
              </div>
              <small>{selectedLoad.progress}% complete - ETA {selectedLoad.eta}</small>
            </div>
          </div>
          <div className="load-tabs">
            {loads.map((load) => (
              <button key={load.id} type="button" onClick={() => setSelectedLoadId(load.id)}>
                <span>{load.id}</span>
                <strong className={`status-pill ${statusClass(load.status)}`}>{load.status}</strong>
              </button>
            ))}
          </div>
        </>
      ) : (
        <EmptyLoadsPanel />
      )}
    </section>

    <section className="panel">
      <div className="panel-heading">
        <h2>Actividad</h2>
      </div>
      <ul className="activity-list">
        {activity.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  </div>
);

const KpiCard = ({ icon, label, value, trend }) => (
  <article className="kpi-card">
    <div className="kpi-icon">
      <FontAwesomeIcon icon={icon} />
    </div>
    <span>{label}</span>
    <strong>{value}</strong>
    <small>{trend}</small>
  </article>
);

const EmptyLoadsPanel = () => (
  <section className="panel empty-state-panel">
    <h2>No hay cargas asignadas</h2>
    <p>Cuando una carga sea asignada a este conductor, aparecera aqui para tracking y operacion.</p>
  </section>
);

const emptyLoadForm = {
  customer: "",
  origin: "",
  destination: "",
  pickup: "",
  delivery: "",
  driver: "Unassigned",
  status: "Pending Assignment",
  invoice: "Draft",
  rate: 0,
};

const loadToForm = (load) => ({
  customer: load.customer || "",
  origin: load.origin || "",
  destination: load.destination || "",
  pickup: load.pickup || "",
  delivery: load.delivery || "",
  driver: load.driver || "Unassigned",
  status: load.status || "Pending Assignment",
  invoice: load.invoice || "Draft",
  rate: load.rate ?? 0,
});

const LoadsPanel = ({ loads, selectedLoadId, setSelectedLoadId, createLoad, updateLoad, canManageLoads }) => {
  const [modalMode, setModalMode] = useState(null);
  const [editingLoad, setEditingLoad] = useState(null);
  const [form, setForm] = useState(emptyLoadForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreateModal = () => {
    setEditingLoad(null);
    setForm(emptyLoadForm);
    setFormError("");
    setModalMode("create");
  };

  const openUpdateModal = (load) => {
    setEditingLoad(load);
    setForm(loadToForm(load));
    setFormError("");
    setModalMode("update");
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingLoad(null);
    setFormError("");
    setSaving(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const buildPayload = () => ({
    ...form,
    rate: Number(form.rate) || 0,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const payload = buildPayload();
      if (modalMode === "create") {
        await createLoad(payload);
      } else if (editingLoad) {
        await updateLoad(editingLoad.id, payload, `${editingLoad.id} updated from load board.`);
      }
      closeModal();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const openDocumentFile = async (document) => {
    if (!document.file_url) return;
    const token = localStorage.getItem("ydhm_api_token");
    const response = await fetch(document.file_url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      setFormError("No se pudo abrir el archivo.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Load lifecycle</span>
          <h2>Historial y estado de cargas</h2>
        </div>
        {canManageLoads && <button className="primary-action" type="button" onClick={openCreateModal}>Crear carga</button>}
      </div>
      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Load</th>
              <th>Cliente</th>
              <th>Ruta</th>
              <th>Driver</th>
              <th>Estado</th>
              <th>Docs</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {loads.map((load) => (
              <tr className={selectedLoadId === load.id ? "selected-row" : ""} key={load.id} onClick={() => setSelectedLoadId(load.id)}>
                <td><strong>{load.id}</strong></td>
                <td>{load.customer}</td>
                <td>{load.origin} - {load.destination}</td>
                <td>{load.driver}</td>
                <td><span className={`status-pill ${statusClass(load.status)}`}>{load.status}</span></td>
                <td>{load.docs}</td>
                <td>
                  {canManageLoads ? (
                    <button className="table-action" type="button" onClick={(event) => {
                      event.stopPropagation();
                      openUpdateModal(load);
                    }}>
                      Actualizar
                    </button>
                  ) : (
                    <span className="muted-action">Solo lectura</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(modalMode === "create" || modalMode === "update") && (
        <LoadModal
          mode={modalMode}
          form={form}
          formError={formError}
          saving={saving}
          onChange={handleChange}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
};

const LoadModal = ({ mode, form, formError, saving, onChange, onClose, onSubmit }) => (
  <div className="dashboard-modal-overlay" onClick={onClose}>
    <div className="dashboard-modal load-modal" onClick={(event) => event.stopPropagation()}>
      <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">x</button>
      <span className="eyebrow">{mode === "create" ? "Nueva carga" : "Editar carga"}</span>
      <h2>{mode === "create" ? "Crear carga" : "Actualizar carga"}</h2>
      <form onSubmit={onSubmit}>
        <div className="modal-form-grid">
          <label>
            Cliente
            <input name="customer" value={form.customer} onChange={onChange} required />
          </label>
          <label>
            Origen
            <input name="origin" value={form.origin} onChange={onChange} required />
          </label>
          <label>
            Destino
            <input name="destination" value={form.destination} onChange={onChange} required />
          </label>
          <label>
            Pickup
            <input name="pickup" value={form.pickup} onChange={onChange} required />
          </label>
          <label>
            Delivery
            <input name="delivery" value={form.delivery} onChange={onChange} required />
          </label>
          <label>
            Estado
            <select name="status" value={form.status} onChange={onChange}>
              <option value="Pending Assignment">Pending Assignment</option>
              <option value="Awaiting Driver Confirmation">Awaiting Driver Confirmation</option>
              <option value="Accepted">Accepted</option>
              <option value="In Transit">In Transit</option>
              <option value="Delayed">Delayed</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
          <label>
            Invoice
            <select name="invoice" value={form.invoice} onChange={onChange}>
              <option value="Draft">Draft</option>
              <option value="Pending POD">Pending POD</option>
              <option value="Ready">Ready</option>
              <option value="Issued">Issued</option>
              <option value="Paid">Paid</option>
            </select>
          </label>
          <label>
            Rate
            <input name="rate" type="number" min="0" value={form.rate} onChange={onChange} />
          </label>
        </div>
        {formError && <p className="modal-error">{formError}</p>}
        <button className="primary-action" type="submit">{saving ? "Guardando..." : mode === "create" ? "Crear carga" : "Guardar cambios"}</button>
      </form>
    </div>
  </div>
);

const AssignLoadModal = ({ load, drivers, selectedDriver, formError, saving, onDriverChange, onClose, onSubmit }) => (
  <div className="dashboard-modal-overlay" onClick={onClose}>
    <div className="dashboard-modal assign-modal" onClick={(event) => event.stopPropagation()}>
      <button className="modal-close" type="button" onClick={onClose} aria-label="Cerrar">x</button>
      <span className="eyebrow">Asignacion de conductor</span>
      <h2>{load?.driver && load.driver !== "Unassigned" ? "Reasignar carga" : "Asignar carga"}</h2>
      {load && (
        <div className="assign-load-summary">
          <strong>{load.id}</strong>
          <span>{load.origin} - {load.destination}</span>
          <small>Conductor actual: {load.driver || "Unassigned"}</small>
        </div>
      )}
      <form onSubmit={onSubmit}>
        <label>
          Conductores disponibles
          <select value={selectedDriver} onChange={(event) => onDriverChange(event.target.value)} required>
            <option value="" disabled>Selecciona un conductor</option>
            {drivers.map((driver) => (
              <option key={driver.id || driver.name} value={driver.name}>
                {driver.name} - {driver.status} - {driver.location}
              </option>
            ))}
          </select>
        </label>
        <div className="driver-choice-list">
          {drivers.map((driver) => (
            <button
              className={selectedDriver === driver.name ? "selected" : ""}
              key={driver.id || driver.name}
              type="button"
              onClick={() => onDriverChange(driver.name)}
            >
              <strong>{driver.name}</strong>
              <span>{driver.location}</span>
              <small>{driver.status} - {driver.score}%</small>
            </button>
          ))}
        </div>
        {!drivers.length && <p className="modal-error">No hay conductores cargados.</p>}
        {formError && <p className="modal-error">{formError}</p>}
        <button className="primary-action" type="submit" disabled={!drivers.length || saving}>
          {saving ? "Guardando..." : "Guardar asignacion"}
        </button>
      </form>
    </div>
  </div>
);

const DispatchPanel = ({ loads, drivers, assignLoad }) => {
  const [selectedLoad, setSelectedLoad] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const openAssignModal = (load) => {
    setSelectedLoad(load);
    setSelectedDriver(load.driver && load.driver !== "Unassigned" ? load.driver : drivers[0]?.name || "");
    setFormError("");
  };

  const closeAssignModal = () => {
    setSelectedLoad(null);
    setSelectedDriver("");
    setFormError("");
    setSaving(false);
  };

  const handleAssignSubmit = async (event) => {
    event.preventDefault();
    if (!selectedLoad) return;
    if (!selectedDriver) {
      setFormError("Selecciona un conductor.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await assignLoad(selectedLoad.id, selectedDriver);
      closeAssignModal();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="split-layout">
      <section className="panel">
        <div className="panel-heading">
          <h2>Conductores disponibles</h2>
        </div>
        <div className="driver-list">
          {drivers.map((driver) => (
            <article key={driver.id || driver.name}>
              <div>
                <strong>{driver.name}</strong>
                <span>{driver.location}</span>
              </div>
              <span className={`status-pill ${statusClass(driver.status)}`}>{driver.status}</span>
              <small>{driver.score}%</small>
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Asignacion rapida</h2>
        </div>
        <div className="assignment-stack">
          {loads.filter((load) => load.status !== "Delivered").map((load) => (
            <article key={load.id}>
              <div>
                <strong>{load.id}</strong>
                <span>{load.origin} - {load.destination}</span>
                <small>Driver: {load.driver || "Unassigned"}</small>
              </div>
              <button type="button" onClick={() => openAssignModal(load)}>
                {load.driver && load.driver !== "Unassigned" ? "Reasignar" : "Asignar"}
              </button>
            </article>
          ))}
        </div>
      </section>

      {selectedLoad && (
        <AssignLoadModal
          load={selectedLoad}
          drivers={drivers}
          selectedDriver={selectedDriver}
          formError={formError}
          saving={saving}
          onDriverChange={setSelectedDriver}
          onClose={closeAssignModal}
          onSubmit={handleAssignSubmit}
        />
      )}
    </div>
  );
};

const RoutePlannerPanel = ({ loads, selectedLoadId, setSelectedLoadId, updateLoad }) => {
  const selectedLoad = loads.find((load) => load.id === selectedLoadId) || loads[0];
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const routeMarkersRef = useRef([]);
  const [form, setForm] = useState({
    route_stops: selectedLoad?.route_stops || "",
    route_notes: selectedLoad?.route_notes || "",
  });
  const [routeData, setRouteData] = useState(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routeStatus, setRouteStatus] = useState(mapboxToken ? "idle" : "missing-token");
  const [routeError, setRouteError] = useState("");
  const [saving, setSaving] = useState(false);
  const stops = splitRouteStops(form.route_stops);
  const routePoints = useMemo(
    () => (selectedLoad ? [selectedLoad.origin, ...stops, selectedLoad.destination] : []),
    [selectedLoad?.origin, selectedLoad?.destination, form.route_stops],
  );
  const routeKey = routePoints.join("|");

  useEffect(() => {
    setForm({
      route_stops: selectedLoad?.route_stops || "",
      route_notes: selectedLoad?.route_notes || "",
    });
  }, [selectedLoad?.id, selectedLoad?.route_stops, selectedLoad?.route_notes]);

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || mapRef.current) return;
    mapboxgl.accessToken = mapboxToken;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-82.5, 29.8],
      zoom: 5.2,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    return () => {
      routeMarkersRef.current.forEach((marker) => marker.remove());
      routeMarkersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selectedLoad || !mapboxToken || routePoints.length < 2) return;
    const controller = new AbortController();
    setRouteStatus("loading");
    setRouteError("");
    fetchMapboxRoute(routePoints, controller.signal)
      .then((nextRoute) => {
        setRouteData(nextRoute);
        setSelectedRouteIndex(0);
        setRouteStatus("ready");
      })
      .catch((error) => {
        if (error.name === "AbortError") return;
        setRouteData(null);
        setRouteStatus("error");
        setRouteError(error.message);
      });

    return () => controller.abort();
  }, [selectedLoad?.id, routeKey]);

  useEffect(() => {
    const map = mapRef.current;
    const selectedRoute = routeData?.routes?.[selectedRouteIndex] || routeData?.routes?.[0];
    if (!map || !selectedRoute?.geometry || !routeData?.coordinates?.length) return;

    const drawRoute = () => {
      routeMarkersRef.current.forEach((marker) => marker.remove());
      routeMarkersRef.current = routeData.coordinates.map((coordinate, index) => {
        const label = index === 0 ? "Pickup" : index === routeData.coordinates.length - 1 ? "Delivery" : `${index}`;
        return new mapboxgl.Marker({ color: index === 0 ? "#0b4d8f" : index === routeData.coordinates.length - 1 ? "#050812" : "#f4c400" })
          .setLngLat(coordinate)
          .setPopup(new mapboxgl.Popup({ offset: 18 }).setText(`${label}: ${routePoints[index]}`))
          .addTo(map);
      });

      if (map.getLayer("ydhm-route-line")) {
        map.removeLayer("ydhm-route-line");
      }
      if (map.getSource("ydhm-route")) {
        map.removeSource("ydhm-route");
      }
      map.addSource("ydhm-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: selectedRoute.geometry,
        },
      });
      map.addLayer({
        id: "ydhm-route-line",
        type: "line",
        source: "ydhm-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#0b4d8f", "line-width": 5, "line-opacity": 0.9 },
      });

      const bounds = routeData.coordinates.reduce(
        (currentBounds, coordinate) => currentBounds.extend(coordinate),
        new mapboxgl.LngLatBounds(routeData.coordinates[0], routeData.coordinates[0]),
      );
      map.fitBounds(bounds, { padding: 70, maxZoom: 9, duration: 700 });
    };

    if (map.loaded()) {
      drawRoute();
    } else {
      map.once("load", drawRoute);
    }
  }, [routeData, selectedRouteIndex, routeKey]);

  if (!selectedLoad) {
    return (
      <section className="panel">
        <h2>No hay cargas para trazar ruta.</h2>
      </section>
    );
  }

  const estimate = estimateRoutePlan(selectedLoad, stops);
  const selectedRoute = routeData?.routes?.[selectedRouteIndex] || routeData?.routes?.[0] || null;
  const shortestRoute = routeData?.routes?.length
    ? routeData.routes.reduce((bestRoute, route) => (route.rawDistance < bestRoute.rawDistance ? route : bestRoute), routeData.routes[0])
    : null;
  const plannedDistance = selectedRoute?.distance || selectedLoad.route_distance || estimate.route_distance;
  const plannedDuration = selectedRoute?.duration || selectedLoad.route_duration || estimate.route_duration;
  const googleMapsUrl = buildGoogleMapsDirectionsUrl(routePoints);

  const handleSaveRoute = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      route_stops: form.route_stops.trim(),
      route_notes: form.route_notes.trim(),
      route_distance: selectedRoute?.distance || estimate.route_distance,
      route_duration: selectedRoute?.duration || estimate.route_duration,
      route_geometry: selectedRoute?.geometry ? JSON.stringify(selectedRoute.geometry) : selectedLoad.route_geometry || "",
    };
    try {
      await updateLoad(selectedLoad.id, payload, `Route plan updated for ${selectedLoad.id}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="route-planner-layout">
      <section className="panel route-planner-main">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Route planning</span>
            <h2>Trazar ruta para la carga</h2>
          </div>
          <span className="badge-soft">{selectedLoad.driver || "Sin conductor"}</span>
        </div>

        <div className="mapbox-route-shell">
          <div className="mapbox-route-map" ref={mapContainerRef} />
          <div className="mapbox-route-status">
            {routeStatus === "loading" && "Calculando ruta con Mapbox..."}
            {routeStatus === "ready" && "Ruta real calculada con Mapbox"}
            {routeStatus === "missing-token" && "Falta configurar VITE_MAPBOX_TOKEN"}
            {routeStatus === "error" && (routeError || "No se pudo calcular la ruta")}
          </div>
        </div>

        <div className="route-summary-grid">
          <article>
            <span>Origen</span>
            <strong>{selectedLoad.origin}</strong>
          </article>
          <article>
            <span>Destino</span>
            <strong>{selectedLoad.destination}</strong>
          </article>
          <article>
            <span>Distancia estimada</span>
            <strong>{plannedDistance}</strong>
          </article>
          <article>
            <span>Tiempo estimado</span>
            <strong>{plannedDuration}</strong>
          </article>
        </div>

        {routeData?.routes?.length > 0 && (
          <div className="route-options">
            {routeData.routes.map((route, index) => {
              const optionLabel = shortestRoute?.id === route.id ? "Mas corta" : route.label;
              return (
                <button
                  className={selectedRouteIndex === index ? "selected" : ""}
                  key={route.id}
                  type="button"
                  onClick={() => setSelectedRouteIndex(index)}
                >
                  <span>{optionLabel}</span>
                  <strong>{route.distance}</strong>
                  <small>{route.duration}</small>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel route-planner-side">
        <div className="panel-heading">
          <h2>Cargas</h2>
        </div>
        <div className="route-load-list">
          {loads.map((load) => (
            <button
              className={load.id === selectedLoad.id ? "selected" : ""}
              key={load.id}
              type="button"
              onClick={() => setSelectedLoadId(load.id)}
            >
              <strong>{load.id}</strong>
              <span>{load.origin} - {load.destination}</span>
              <small>{load.route_distance ? `Ruta guardada: ${load.route_distance}` : "Sin ruta guardada"}</small>
            </button>
          ))}
        </div>

        <form className="route-form" onSubmit={handleSaveRoute}>
          <label>
            Paradas intermedias
            <textarea
              name="route_stops"
              placeholder="Una parada por linea. Ej: Lake City, FL"
              value={form.route_stops}
              onChange={(event) => setForm((current) => ({ ...current, route_stops: event.target.value }))}
            />
          </label>
          <label>
            Instrucciones para el driver
            <textarea
              name="route_notes"
              placeholder="Peajes, fuel stop, ruta preferida, restricciones, cita de delivery..."
              value={form.route_notes}
              onChange={(event) => setForm((current) => ({ ...current, route_notes: event.target.value }))}
            />
          </label>
          <div className="route-itinerary">
            {routePoints.map((point, index) => (
              <div key={`${point}-${index}`}>
                <span>{index + 1}</span>
                <strong>{point}</strong>
              </div>
            ))}
          </div>
          <div className="route-action-row">
            <button className="primary-action" type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar ruta"}
            </button>
            {googleMapsUrl && (
              <a className="secondary-route-action" href={googleMapsUrl} target="_blank" rel="noreferrer">
                Abrir en Google Maps
              </a>
            )}
          </div>
        </form>
      </section>
    </div>
  );
};

const DriverPanel = ({ selectedLoad, updateLoad }) => {
  const [gpsStatus, setGpsStatus] = useState("");
  const [liveGpsEnabled, setLiveGpsEnabled] = useState(false);
  const gpsTimerRef = useRef(null);

  const sendGpsLocation = (silent = false, liveShare = liveGpsEnabled) => {
    if (!navigator.geolocation) {
      setGpsStatus("GPS no disponible en este dispositivo.");
      return Promise.reject(new Error("GPS no disponible en este dispositivo."));
    }
    if (!silent) setGpsStatus("Obteniendo GPS...");
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await logisticsApi.recordTrackingLocation(selectedLoad.id, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              label: liveShare ? "Driver live GPS sharing" : "Driver GPS live update",
            });
            setGpsStatus(`GPS actualizado ${new Date().toLocaleTimeString()}.`);
            resolve();
          } catch (error) {
            setGpsStatus(error.message);
            reject(error);
          }
        },
        () => {
          const error = new Error("No se pudo obtener permiso GPS.");
          setGpsStatus(error.message);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
      );
    });
  };

  useEffect(() => {
    if (gpsTimerRef.current) {
      window.clearInterval(gpsTimerRef.current);
      gpsTimerRef.current = null;
    }

    if (!liveGpsEnabled) return undefined;
    setGpsStatus("Compartiendo ubicacion cada 2 minutos.");
    sendGpsLocation(true, true).catch(() => setLiveGpsEnabled(false));
    gpsTimerRef.current = window.setInterval(() => {
      sendGpsLocation(true, true).catch(() => setLiveGpsEnabled(false));
    }, 120000);

    return () => {
      if (gpsTimerRef.current) {
        window.clearInterval(gpsTimerRef.current);
        gpsTimerRef.current = null;
      }
    };
  }, [liveGpsEnabled, selectedLoad.id]);

  const toggleLiveGps = () => {
    setLiveGpsEnabled((current) => {
      const nextValue = !current;
      if (!nextValue) setGpsStatus("Ubicacion en vivo detenida.");
      return nextValue;
    });
  };

  return (
    <section className="driver-phone">
      <div className="phone-shell">
        <div className="phone-top">
          <span>YDHM Driver</span>
          <strong>{selectedLoad.id}</strong>
        </div>
        <div className="phone-load-card">
          <FontAwesomeIcon icon={faTruckFast} />
          <h2>{selectedLoad.origin}</h2>
          <p>Delivery: {selectedLoad.destination}</p>
          <span className={`status-pill ${statusClass(selectedLoad.status)}`}>{selectedLoad.status}</span>
        </div>
        <div className="driver-actions">
          <button type="button" onClick={() => updateLoad(selectedLoad.id, { status: "Accepted" }, `${selectedLoad.id} accepted by driver.`)}>Aceptar carga</button>
          <button type="button" onClick={() => updateLoad(selectedLoad.id, { status: "Arrived at Pickup" }, `${selectedLoad.id} arrived at pickup.`)}>Llegue al pickup</button>
          <button type="button" onClick={() => updateLoad(selectedLoad.id, { status: "In Transit" }, `${selectedLoad.id} picked up and in transit.`)}>Confirmar pickup</button>
          <button type="button" onClick={() => sendGpsLocation()}>Enviar ubicacion GPS</button>
          <button type="button" onClick={() => updateLoad(selectedLoad.id, { status: "Delivered" }, `${selectedLoad.id} delivered with POD pending review.`)}>Confirmar entrega</button>
        </div>
        <button className={`driver-live-toggle ${liveGpsEnabled ? "enabled" : ""}`} type="button" onClick={toggleLiveGps}>
          <span>{liveGpsEnabled ? "ON" : "OFF"}</span>
          Compartir ubicacion en vivo
        </button>
        {gpsStatus && <p className="driver-gps-status">{gpsStatus}</p>}
      </div>
    </section>
  );
};

const LoadTrackingMap = ({ selectedLoad, compact = false }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [tracking, setTracking] = useState(null);
  const [plannedRouteGeometry, setPlannedRouteGeometry] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState(mapboxToken ? "loading" : "missing-token");
  const [trackingError, setTrackingError] = useState("");
  const plannedRoutePoints = useMemo(
    () => (selectedLoad ? [selectedLoad.origin, ...splitRouteStops(selectedLoad.route_stops), selectedLoad.destination] : []),
    [selectedLoad?.origin, selectedLoad?.route_stops, selectedLoad?.destination],
  );
  const plannedRouteKey = plannedRoutePoints.join("|");

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || mapRef.current) return;
    mapboxgl.accessToken = mapboxToken;
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-83.4, 30.8],
      zoom: 5,
    });
    mapRef.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selectedLoad?.id) return undefined;
    if (selectedLoad.route_geometry) {
      try {
        setPlannedRouteGeometry(JSON.parse(selectedLoad.route_geometry));
        return undefined;
      } catch {
        setPlannedRouteGeometry(null);
      }
    }

    if (!mapboxToken || plannedRoutePoints.length < 2) {
      setPlannedRouteGeometry(null);
      return undefined;
    }

    const controller = new AbortController();
    fetchMapboxRoute(plannedRoutePoints, controller.signal)
      .then((data) => setPlannedRouteGeometry(data.routes?.[0]?.geometry || null))
      .catch((error) => {
        if (error.name !== "AbortError") setPlannedRouteGeometry(null);
      });
    return () => controller.abort();
  }, [selectedLoad?.id, selectedLoad?.route_geometry, plannedRouteKey]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const drawPlannedRoute = () => {
      if (map.getLayer("ydhm-planned-route-line")) {
        map.removeLayer("ydhm-planned-route-line");
      }
      if (map.getSource("ydhm-planned-route")) {
        map.removeSource("ydhm-planned-route");
      }
      if (!plannedRouteGeometry) return;
      map.addSource("ydhm-planned-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: plannedRouteGeometry,
        },
      });
      const beforeLayer = map.getLayer("ydhm-tracking-line") ? "ydhm-tracking-line" : undefined;
      map.addLayer({
        id: "ydhm-planned-route-line",
        type: "line",
        source: "ydhm-planned-route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#23b7e5", "line-width": 6, "line-opacity": 0.55 },
      }, beforeLayer);
    };

    if (map.loaded()) {
      drawPlannedRoute();
    } else {
      map.once("load", drawPlannedRoute);
    }
  }, [plannedRouteGeometry, selectedLoad?.id]);

  useEffect(() => {
    if (!selectedLoad?.id) return undefined;
    let isMounted = true;

    const loadTracking = () => {
      setTrackingStatus("loading");
      logisticsApi.getLiveTracking(selectedLoad.id)
        .then((data) => {
          if (!isMounted) return;
          setTracking(data);
          setTrackingStatus("ready");
          setTrackingError("");
        })
        .catch((error) => {
          if (!isMounted) return;
          setTrackingStatus("error");
          setTrackingError(error.message);
        });
    };

    loadTracking();
    const timer = window.setInterval(loadTracking, 120000);
    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, [selectedLoad?.id]);

  useEffect(() => {
    const map = mapRef.current;
    const location = tracking?.location;
    if (!map || !location) return;

    const coordinate = [Number(location.longitude), Number(location.latitude)];
    const drawTracking = () => {
      markerRef.current?.remove();
      markerRef.current = new mapboxgl.Marker({ color: "#f4c400" })
        .setLngLat(coordinate)
        .setPopup(new mapboxgl.Popup({ offset: 18 }).setText(`${selectedLoad.id}: ${location.label}`))
        .addTo(map);

      const historyCoordinates = (tracking.history || [])
        .map((point) => [Number(point.longitude), Number(point.latitude)])
        .filter(([longitude, latitude]) => Number.isFinite(longitude) && Number.isFinite(latitude));

      if (map.getLayer("ydhm-tracking-line")) {
        map.removeLayer("ydhm-tracking-line");
      }
      if (map.getSource("ydhm-tracking")) {
        map.removeSource("ydhm-tracking");
      }
      if (historyCoordinates.length > 1) {
        map.addSource("ydhm-tracking", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: historyCoordinates },
          },
        });
        map.addLayer({
          id: "ydhm-tracking-line",
          type: "line",
          source: "ydhm-tracking",
          layout: { "line-join": "round", "line-cap": "round" },
          paint: { "line-color": "#0b4d8f", "line-width": 4, "line-opacity": 0.8 },
        });
      }
      map.flyTo({ center: coordinate, zoom: 8, essential: true });
    };

    if (map.loaded()) {
      drawTracking();
    } else {
      map.once("load", drawTracking);
    }
  }, [tracking, selectedLoad?.id]);

  const lastUpdated = tracking?.location?.recorded_at
    ? new Date(tracking.location.recorded_at).toLocaleString()
    : "Sin ubicacion";

  return (
    <>
      <div className={compact ? "tracking-map-shell dashboard-tracking-map-shell" : "tracking-map-shell"}>
        <div className="tracking-map" ref={mapContainerRef} />
        <div className="mapbox-route-status">
          {trackingStatus === "loading" && "Actualizando ubicacion..."}
          {trackingStatus === "ready" && "Ubicacion cacheada en backend"}
          {trackingStatus === "missing-token" && "Falta configurar VITE_MAPBOX_TOKEN"}
          {trackingStatus === "error" && (trackingError || "No se pudo cargar tracking")}
        </div>
      </div>
      {!compact && (
        <div className="tracking-meta-grid">
          <article>
            <span>Ubicacion actual</span>
            <strong>{tracking?.location ? `${tracking.location.latitude}, ${tracking.location.longitude}` : "Pendiente"}</strong>
          </article>
          <article>
            <span>Ultima actualizacion</span>
            <strong>{lastUpdated}</strong>
          </article>
          <article>
            <span>Intervalo</span>
            <strong>Cada {tracking?.refresh_seconds || 120}s</strong>
          </article>
          <article>
            <span>Ruta asignada</span>
            <strong>{selectedLoad.route_distance ? `${selectedLoad.route_distance} - ${selectedLoad.route_duration}` : "Sin ruta guardada"}</strong>
          </article>
        </div>
      )}
    </>
  );
};

const TrackingPanel = ({ selectedLoad, loads, setSelectedLoadId }) => {
  return (
    <div className="split-layout tracking-layout">
      <section className="panel panel-map">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Tracking GPS</span>
            <h2>{selectedLoad.id}</h2>
          </div>
          <span className={`status-pill ${statusClass(selectedLoad.status)}`}>{selectedLoad.status}</span>
        </div>
        <LoadTrackingMap selectedLoad={selectedLoad} />
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Cargas monitoreadas</h2>
        </div>
        <div className="tracking-list">
          {loads.map((load) => (
            <button key={load.id} type="button" onClick={() => setSelectedLoadId(load.id)}>
              <strong>{load.id}</strong>
              <span>{load.progress}% - {load.eta}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

const DocumentsPanel = ({ documents, loads, createDocument, deleteDocument, approveDocument, role, currentUserName }) => {
  const canUploadDocument = ["driver", "trucker", "dispatcher", "manager"].includes(role);
  const canApproveDocument = ["dispatcher", "manager"].includes(role);
  const canManageDocuments = ["dispatcher", "manager"].includes(role);
  const [expandedLoadId, setExpandedLoadId] = useState(loads[0]?.id || "");
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({
    load: loads[0]?.id || "",
    type: "Documento PDF",
    visibility: "Operaciones",
    file: null,
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loads.length) return;
    if (!expandedLoadId || !loads.some((load) => load.id === expandedLoadId)) {
      setExpandedLoadId(loads[0].id);
    }
    if (!form.load || !loads.some((load) => load.id === form.load)) {
      setForm((currentForm) => ({ ...currentForm, load: loads[0].id }));
    }
  }, [loads, expandedLoadId, form.load]);

  const documentsByLoad = documents.reduce((groups, document) => {
    groups[document.load] = groups[document.load] || [];
    groups[document.load].push(document);
    return groups;
  }, {});

  const openUploadModal = (loadId = expandedLoadId || loads[0]?.id || "") => {
    setForm({ load: loadId, type: "Documento PDF", visibility: "Operaciones", file: null });
    setFormError("");
    setShowUpload(true);
  };

  const closeUploadModal = () => {
    setShowUpload(false);
    setFormError("");
    setSaving(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((currentForm) => ({ ...currentForm, file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.file) {
      setFormError("Selecciona un archivo o toma una foto antes de guardar.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const created = await createDocument({
        ...form,
        owner: currentUserName,
        status: "Review",
      });
      setExpandedLoadId(created.load);
      closeUploadModal();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Document control</span>
          <h2>Adjuntos y evidencias por carga</h2>
        </div>
        {canUploadDocument && <button className="primary-action" type="button" onClick={() => openUploadModal()}>Adjuntar evidencia</button>}
      </div>
      <div className="document-load-list">
        {loads.map((load) => {
          const loadDocuments = documentsByLoad[load.id] || [];
          const isExpanded = expandedLoadId === load.id;
          return (
            <article className="document-load-group" key={load.id}>
              <button type="button" className="document-load-header" onClick={() => setExpandedLoadId(isExpanded ? "" : load.id)}>
                <div>
                  <strong>{load.id}</strong>
                  <span>{load.customer} - {load.origin} to {load.destination}</span>
                </div>
                <span className="badge-soft">{loadDocuments.length} docs</span>
              </button>
              {isExpanded && (
                <div className="document-list">
                  {canUploadDocument && (
                    <button className="inline-upload-action" type="button" onClick={() => openUploadModal(load.id)}>
                      Adjuntar archivo
                    </button>
                  )}
                  {loadDocuments.map((document) => (
                    <div className="document-row" key={document.id}>
                      <FontAwesomeIcon icon={faFileLines} />
                      <div>
                        <strong>{document.type}</strong>
                        <span>{document.file_name || document.id}</span>
                        <small>{document.owner} - {document.visibility}</small>
                      </div>
                      <span className={`status-pill ${statusClass(document.status)}`}>{document.status}</span>
                      {document.file_url && (
                        <button className="document-file-link" type="button" onClick={() => openDocumentFile(document)}>
                          Ver
                        </button>
                      )}
                      {canApproveDocument && document.status !== "Approved" && (
                        <button type="button" onClick={() => approveDocument(document.id)}>Aprobar</button>
                      )}
                      {(canManageDocuments || document.owner === currentUserName) && (
                        <button className="danger-action" type="button" onClick={() => deleteDocument(document.id)}>Eliminar</button>
                      )}
                    </div>
                  ))}
                  {!loadDocuments.length && <p className="empty-documents">No hay documentos, imagenes o fotos adjuntas a esta carga.</p>}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {showUpload && (
        <div className="dashboard-modal-overlay" onClick={closeUploadModal}>
          <div className="dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={closeUploadModal} aria-label="Cerrar">x</button>
            <span className="eyebrow">Adjuntar evidencia</span>
            <h2>Subir documento, imagen o foto</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Carga
                <select name="load" value={form.load} onChange={handleChange} required>
                  {loads.map((load) => (
                    <option key={load.id} value={load.id}>{load.id} - {load.customer}</option>
                  ))}
                </select>
              </label>
              <label>
                Tipo de adjunto
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="Documento PDF">Documento PDF</option>
                  <option value="Imagen">Imagen</option>
                  <option value="Foto">Foto</option>
                  <option value="Bill of Lading">Bill of Lading</option>
                  <option value="Rate Confirmation">Rate Confirmation</option>
                  <option value="Proof of Delivery">Proof of Delivery</option>
                  <option value="Damage Photo">Damage Photo</option>
                  <option value="Other">Otro</option>
                </select>
              </label>
              <label>
                Archivo desde PC
                <input
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,image/*,application/pdf"
                  onChange={handleFileChange}
                  type="file"
                />
              </label>
              <label>
                Tomar foto con camara
                <input
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  type="file"
                />
              </label>
              {form.file && <p className="selected-file-name">Archivo seleccionado: {form.file.name}</p>}
              <label>
                Visibilidad
                <select name="visibility" value={form.visibility} onChange={handleChange}>
                  <option value="Operaciones">Operaciones</option>
                  <option value="Cliente">Cliente</option>
                  <option value="Interno">Interno</option>
                </select>
              </label>
              {formError && <p className="modal-error">{formError}</p>}
              <button className="primary-action" type="submit">{saving ? "Subiendo..." : "Guardar adjunto"}</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

const InvoicesPanel = ({ invoices, loads, createInvoice, issueInvoice, role }) => {
  const canManageInvoices = ["dispatcher", "manager"].includes(role);
  const invoicedLoadIds = new Set(invoices.map((invoice) => invoice.load));
  const invoiceableLoads = loads.filter((load) => !invoicedLoadIds.has(load.id));
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [form, setForm] = useState({
    load: invoiceableLoads[0]?.id || "",
    due: "",
    status: "Ready",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!invoiceableLoads.length) return;
    if (!form.load || !invoiceableLoads.some((load) => load.id === form.load)) {
      setForm((currentForm) => ({ ...currentForm, load: invoiceableLoads[0].id }));
    }
  }, [invoiceableLoads, form.load]);

  const selectedLoad = loads.find((load) => load.id === form.load);

  const closeCreateInvoice = () => {
    setShowCreateInvoice(false);
    setFormError("");
    setSaving(false);
  };

  const openCreateInvoice = () => {
    setForm({
      load: invoiceableLoads[0]?.id || "",
      due: "",
      status: "Ready",
    });
    setFormError("");
    setShowCreateInvoice(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.load) {
      setFormError("Selecciona una carga para facturar.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const load = loads.find((item) => item.id === form.load);
      await createInvoice({
        load: form.load,
        total: load?.rate || 0,
        due: form.due,
        status: form.status,
      });
      closeCreateInvoice();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Billing</span>
          <h2>Facturas por carga</h2>
        </div>
        {canManageInvoices && (
          <button className="primary-action" type="button" onClick={openCreateInvoice} disabled={!invoiceableLoads.length}>
            Crear factura
          </button>
        )}
      </div>
      <div className="invoice-list">
        {invoices.map((invoice) => (
          <article key={invoice.id}>
            <div>
              <strong>{invoice.id}</strong>
              <span>{invoice.customer} - {invoice.load}</span>
              {invoice.due && <small>Due: {invoice.due}</small>}
            </div>
            <strong>{formatMoney(invoice.total)}</strong>
            <span className={`status-pill ${statusClass(invoice.status)}`}>{invoice.status}</span>
            {canManageInvoices && invoice.status === "Ready" && (
              <button type="button" onClick={() => issueInvoice(invoice.id)}>Emitir</button>
            )}
          </article>
        ))}
      </div>

      {showCreateInvoice && (
        <div className="dashboard-modal-overlay" onClick={closeCreateInvoice}>
          <div className="dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={closeCreateInvoice} aria-label="Cerrar">x</button>
            <span className="eyebrow">Crear factura</span>
            <h2>Facturar carga</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Carga
                <select name="load" value={form.load} onChange={handleChange} required>
                  {invoiceableLoads.map((load) => (
                    <option key={load.id} value={load.id}>
                      {load.id} - {load.customer} - {formatMoney(load.rate)}
                    </option>
                  ))}
                </select>
              </label>
              {selectedLoad && (
                <div className="invoice-load-summary">
                  <strong>{selectedLoad.customer}</strong>
                  <span>{selectedLoad.origin} - {selectedLoad.destination}</span>
                  <small>Total: {formatMoney(selectedLoad.rate)}</small>
                </div>
              )}
              <label>
                Fecha de vencimiento
                <input name="due" value={form.due} onChange={handleChange} placeholder="Jul 30" />
              </label>
              <label>
                Estado inicial
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="Ready">Ready</option>
                  <option value="Issued">Issued</option>
                </select>
              </label>
              {formError && <p className="modal-error">{formError}</p>}
              <button className="primary-action" type="submit">{saving ? "Creando..." : "Crear factura"}</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

const IncidentsPanel = ({ loads, incidents, createIncident, resolveIncident, role }) => {
  const canCreateIncident = ["driver", "trucker", "dispatcher", "manager"].includes(role);
  const canResolveIncident = ["dispatcher", "manager"].includes(role);
  const [showCreateIncident, setShowCreateIncident] = useState(false);
  const [form, setForm] = useState({
    load: loads[0]?.id || "",
    type: "Delay",
    priority: "Medium",
    description: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loads.length) return;
    if (!form.load || !loads.some((load) => load.id === form.load)) {
      setForm((currentForm) => ({ ...currentForm, load: loads[0].id }));
    }
  }, [loads, form.load]);

  const loadById = loads.reduce((items, load) => {
    items[load.id] = load;
    return items;
  }, {});

  const openCreateIncident = () => {
    setForm({ load: loads[0]?.id || "", type: "Delay", priority: "Medium", description: "" });
    setFormError("");
    setShowCreateIncident(true);
  };

  const closeCreateIncident = () => {
    setShowCreateIncident(false);
    setFormError("");
    setSaving(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.load) {
      setFormError("Selecciona una carga.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await createIncident(form);
      closeCreateIncident();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Centro de incidencias</h2>
        {canCreateIncident && <button className="primary-action" type="button" onClick={openCreateIncident}>Nueva incidencia</button>}
      </div>
      <div className="incident-board">
        {incidents.map((incident) => {
          const load = loadById[incident.load];
          const isResolved = incident.status === "Resolved";
          return (
            <article key={incident.id}>
              <FontAwesomeIcon icon={isResolved ? faCircleCheck : incident.priority === "High" ? faTriangleExclamation : faClockRotateLeft} />
              <div>
                <strong>{incident.load}</strong>
                <span>{incident.type} - {incident.priority}</span>
                <small>{incident.description || "Sin descripcion"}{load ? ` - ${load.origin} to ${load.destination}` : ""}</small>
              </div>
              <span className={`status-pill ${statusClass(incident.status)}`}>{incident.status}</span>
              {canResolveIncident && !isResolved && (
                <button type="button" onClick={() => resolveIncident(incident.id)}>
                  Resolver
                </button>
              )}
            </article>
          );
        })}
        {!incidents.length && <p className="empty-documents">No hay incidencias registradas.</p>}
      </div>

      {showCreateIncident && (
        <div className="dashboard-modal-overlay" onClick={closeCreateIncident}>
          <div className="dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={closeCreateIncident} aria-label="Cerrar">x</button>
            <span className="eyebrow">Nueva incidencia</span>
            <h2>Reportar incidencia</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Carga
                <select name="load" value={form.load} onChange={handleChange} required>
                  {loads.map((load) => (
                    <option key={load.id} value={load.id}>{load.id} - {load.customer}</option>
                  ))}
                </select>
              </label>
              <label>
                Tipo
                <select name="type" value={form.type} onChange={handleChange}>
                  <option value="Delay">Delay</option>
                  <option value="Damage">Damage</option>
                  <option value="Route issue">Route issue</option>
                  <option value="Document issue">Document issue</option>
                  <option value="Customer request">Customer request</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                Prioridad
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </label>
              <label>
                Descripcion
                <textarea name="description" value={form.description} onChange={handleChange} rows="4" placeholder="Describe que ocurrio y que se necesita revisar." />
              </label>
              {formError && <p className="modal-error">{formError}</p>}
              <button className="primary-action" type="submit">{saving ? "Guardando..." : "Crear incidencia"}</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

const UsersPanel = ({ profiles, users, loads, createUser, updateUser, deleteUser }) => {
  const [selectedRole, setSelectedRole] = useState("manager");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    company: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const roleEntries = Object.entries(profiles);
  const visibleUsers = users.filter((item) => item.role === selectedRole);

  useEffect(() => {
    if (!profiles[selectedRole]) {
      setSelectedRole(roleEntries[0]?.[0] || "customer");
    }
  }, [profiles, roleEntries, selectedRole]);

  const serviceSummary = (userItem) => {
    if (userItem.role === "customer") {
      return loads.filter((load) => load.customer === userItem.company).map((load) => load.id);
    }
    if (userItem.role === "driver") {
      return loads.filter((load) => load.driver === userItem.name).map((load) => load.id);
    }
    if (["dispatcher", "manager"].includes(userItem.role)) {
      return loads.map((load) => load.id);
    }
    return [];
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const closeCreateUser = () => {
    setShowCreateUser(false);
    setFormError("");
    setForm({ name: "", email: "", password: "", role: "customer", company: "" });
  };

  const openEditUser = (userItem) => {
    setEditingUser(userItem);
    setForm({
      name: userItem.name,
      email: userItem.email,
      password: "",
      role: userItem.role,
      company: userItem.company,
    });
    setFormError("");
  };

  const closeEditUser = () => {
    setEditingUser(null);
    setFormError("");
    setForm({ name: "", email: "", password: "", role: "customer", company: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const created = await createUser(form);
      setSelectedRole(created.role);
      closeCreateUser();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    setFormError("");
    try {
      const payload = { ...form };
      if (!payload.password) {
        delete payload.password;
      }
      const updated = await updateUser(editingUser.id, payload);
      setSelectedRole(updated.role);
      closeEditUser();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userItem) => {
    setSaving(true);
    setFormError("");
    try {
      await deleteUser(userItem.id);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel users-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">RBAC</span>
          <h2>Usuarios, roles y permisos</h2>
        </div>
        <button className="primary-action" type="button" onClick={() => setShowCreateUser(true)}>Crear usuario</button>
      </div>
      <div className="permission-grid">
        {roleEntries.map(([key, item]) => {
          const roleUsers = users.filter((userItem) => userItem.role === key);
          return (
            <button className={`permission-card ${selectedRole === key ? "selected" : ""}`} key={key} type="button" onClick={() => setSelectedRole(key)}>
              <FontAwesomeIcon icon={faUserGear} />
              <strong>{item.label}</strong>
              <span>{roleUsers.length} usuarios activos</span>
              <span>{item.permissions.length} permisos operativos</span>
              <small>{item.permissions.join(" / ")}</small>
            </button>
          );
        })}
      </div>

      <div className="users-role-detail">
        <div className="panel-heading compact">
          <div>
            <span className="eyebrow">Usuarios reales en base de datos</span>
            <h2>{profiles[selectedRole]?.label || selectedRole}</h2>
          </div>
          <span className="badge-soft">{visibleUsers.length} usuarios</span>
        </div>
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Compania / cliente</th>
                <th>Servicios relacionados</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((userItem) => {
                const services = serviceSummary(userItem);
                return (
                  <tr key={userItem.id}>
                    <td><strong>{userItem.name}</strong></td>
                    <td>{userItem.email}</td>
                    <td>{profiles[userItem.role]?.label || userItem.role}</td>
                    <td>{userItem.company}</td>
                    <td>{services.length ? services.join(" / ") : "Sin servicios asignados"}</td>
                    <td><span className={`status-pill ${userItem.active ? "approved" : "delayed"}`}>{userItem.active ? "Activo" : "Inactivo"}</span></td>
                    <td>
                      <div className="table-action-group">
                        <button className="table-action" type="button" onClick={() => openEditUser(userItem)}>Editar</button>
                        {userItem.active && (
                          <button className="table-action danger-action" type="button" onClick={() => handleDeleteUser(userItem)} disabled={saving}>
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!visibleUsers.length && (
                <tr>
                  <td colSpan="7">No hay usuarios creados para este rol.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateUser && (
        <div className="dashboard-modal-overlay" onClick={closeCreateUser}>
          <div className="dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={closeCreateUser} aria-label="Cerrar">x</button>
            <span className="eyebrow">Manager action</span>
            <h2>Crear usuario</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Nombre
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label>
                Email
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </label>
              <label>
                Password
                <input name="password" type="password" minLength="6" value={form.password} onChange={handleChange} required />
              </label>
              <label>
                Rol
                <select name="role" value={form.role} onChange={handleChange}>
                  {roleEntries.map(([key, item]) => (
                    <option key={key} value={key}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Compania / cliente
                <input name="company" value={form.company} onChange={handleChange} placeholder="YDHM Logistics Corp." />
              </label>
              {formError && <p className="modal-error">{formError}</p>}
              <button className="primary-action" type="submit">{saving ? "Creando..." : "Crear usuario"}</button>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="dashboard-modal-overlay" onClick={closeEditUser}>
          <div className="dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={closeEditUser} aria-label="Cerrar">x</button>
            <span className="eyebrow">Manager action</span>
            <h2>Editar usuario</h2>
            <form onSubmit={handleEditSubmit}>
              <label>
                Nombre
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label>
                Email
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </label>
              <label>
                Password
                <input name="password" type="password" minLength="6" value={form.password} onChange={handleChange} placeholder="Dejar en blanco para no cambiar" />
              </label>
              <label>
                Rol
                <select name="role" value={form.role} onChange={handleChange}>
                  {roleEntries.map(([key, item]) => (
                    <option key={key} value={key}>{item.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Compania / cliente
                <input name="company" value={form.company} onChange={handleChange} placeholder="YDHM Logistics Corp." />
              </label>
              {formError && <p className="modal-error">{formError}</p>}
              <button className="primary-action" type="submit">{saving ? "Guardando..." : "Guardar cambios"}</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

const AuditPanel = ({ activity }) => (
  <section className="panel">
    <div className="panel-heading">
      <div>
        <span className="eyebrow">Immutable trail</span>
        <h2>Auditoria operacional</h2>
      </div>
      <FontAwesomeIcon icon={faCircleCheck} />
    </div>
    <ul className="audit-timeline">
      {activity.map((item, index) => (
        <li key={`${item}-${index}`}>
          <span>{index + 1}</span>
          <p>{item}</p>
        </li>
      ))}
    </ul>
  </section>
);

const SupportPanel = () => (
  <section className="panel support-panel">
    <div>
      <span className="eyebrow">Customer care</span>
      <h2>Solicitudes y soporte</h2>
      <p>El cliente puede abrir tickets relacionados con retrasos, documentos, facturas o cambios de direccion. Operaciones recibe el seguimiento dentro de la carga.</p>
    </div>
    <button className="primary-action" type="button">Abrir solicitud</button>
  </section>
);

export default Dashboard;
