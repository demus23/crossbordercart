/*pages\dashboard.tsx*/
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { api, getAxiosErrorMessage } from "@/lib/api";

import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Container,
  Dropdown,
  Form,
  Image,
  InputGroup,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";

import { useDropzone } from "react-dropzone";

import {
  FiBell,
  FiChevronRight,
  FiFileText,
  FiHelpCircle,
  FiHome,
  FiLogOut,
  FiMapPin,
  FiMessageSquare,
  FiPackage,
  FiSearch,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiTruck,
  FiUpload,
  FiUser,
} from "react-icons/fi";

import BillingSummary from "@/components/account/BillingSummary";
import OutstandingInvoicesCard from "@/components/account/OutstandingInvoicesCard";
import TrackingTimeline, { TrackingEvent } from "@/components/TrackingTimeline";
import TrackingSearchCard from "@/components/tracking/TrackingSearchCard";
import AIChatbotModal from "@/components/AIChatbotModal";
import SiteFooter from "@/components/SiteFooter";

// ---------- Theme ----------
const MAIN_COLOR = "#0ea5a2";
const DARK = "#0b3f3e";
const LIGHT_BG = "#f6fbfb";
const CARD_GRADIENT = "linear-gradient(135deg, #e6fffb 0%, #f0fdfa 100%)";
const CHIP_BG = "#e7f9f8";

// ---------- Types ----------
type ProfileType = {
  name: string;
  email: string;
  phone?: string;
  membership?: "Free" | "Premium" | "Pro" | string;
  subscribed?: boolean;
  suiteId?: string | null;
  role?: string;
};

type PackageType = {
  _id?: string;
  tracking: string;
  status: "pending" | "in transit" | "delivered" | "problem" | string;
  value: number;
  updatedAt: string | number;
  receivedAt?: string | Date;
  shippedAt?: string | Date;
  deliveredAt?: string | Date;
  location?: string;
  shipmentTracking?: string;
  checkoutUrl?: string | null;
  invoiceNo?: string | null;
  paymentId?: string | null;
  isPaid?: boolean;
};

type TransactionType = {
  id: string;
  amount: number;
  status: "Pending" | "Completed" | "Failed" | string;
  date: string | number;
};

type AddressType = {
  label: string;
  address: string;
  city?: string;
  country?: string;
  postalCode?: string;
};

type DealType = {
  id: string;
  store: string;
  title: string;
  url: string;
  logo?: string;
  discountText?: string;
};

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string | number;
  read?: boolean;
};

type TrackResponse = {
  tracking: string;
  status: string;
  location?: string;
  lastUpdate?: string;
};

type DocItem = {
  label: string;
  filename: string;
  url?: string;
  uploadedAt?: string | Date;
};

type AddressForm = {
  label: string;
  address: string;
  city?: string;
  country?: string;
  postalCode?: string;
};

// ---------- Data Hook ----------
function useDashboardData() {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [addresses, setAddresses] = useState<AddressType[]>([]);
  const [deals, setDeals] = useState<DealType[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [documents, setDocuments] = useState<DocItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        setError("");

        const [
          profRes,
          pkgsRes,
          txRes,
          addrRes,
          dealsRes,
          notifRes,
          docsRes,
        ] = await Promise.all([
          api.get<ProfileType>("user/profile"),
          api.get<{ packages: PackageType[] }>("packages", {
            params: { user: session.user.id },
          }),
          api.get<{ transactions: TransactionType[] }>("transactions", {
            params: { user: session.user.id },
          }),
          api.get<{ addresses: AddressType[] }>("user/addresses"),
          api.get<{ deals: DealType[] }>("deals"),
          api.get<{ notifications: NotificationItem[] }>("notifications"),
          api.get<{ documents: DocItem[] }>("user/documents"),
        ]);

        if (cancelled) return;

        setProfile(profRes.data);
        setPackages(pkgsRes.data.packages ?? []);
        setTransactions(txRes.data.transactions ?? []);
        setAddresses(addrRes.data.addresses ?? []);
        setDeals(dealsRes.data.deals ?? []);
        setNotifications(notifRes.data.notifications ?? []);
        setDocuments(docsRes.data.documents ?? []);
      } catch (err) {
        if (!cancelled) setError(getAxiosErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const refetchPackages = async () => {
    if (!session?.user?.id) return;
    const r = await api.get<{ packages: PackageType[] }>("packages", {
      params: { user: session.user.id },
    });
    setPackages(r.data.packages ?? []);
  };

  const refetchTransactions = async () => {
    if (!session?.user?.id) return;
    const r = await api.get<{ transactions: TransactionType[] }>("transactions", {
      params: { user: session.user.id },
    });
    setTransactions(r.data.transactions ?? []);
  };

  const refetchAddresses = async () => {
    const r = await api.get<{ addresses: AddressType[] }>("user/addresses");
    setAddresses(r.data.addresses ?? []);
  };

  const refetchDocuments = async () => {
    const r = await api.get<{ documents: DocItem[] }>("user/documents");
    setDocuments(r.data.documents ?? []);
  };

  const saveProfile = async (data: Partial<ProfileType>) => {
    const r = await api.put<ProfileType>("user/profile", data);
    setProfile(r.data);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.put("user/password", { currentPassword, newPassword });
  };

  const trackPackage = async (tracking: string): Promise<TrackResponse> => {
    const t = (tracking || "").trim();
    if (!t) throw new Error("Tracking number is required");

    const res = await fetch(`/api/track?trackingNo=${encodeURIComponent(t)}&limit=1`);
    if (!res.ok) throw new Error("Tracking lookup failed");

    const data = await res.json();
    const ev = Array.isArray(data.events) ? data.events[0] : null;

    if (!ev) return { tracking: t, status: "Not found" };

    return {
      tracking: t,
      status: ev.status || "Pending",
      location: ev.location || "",
      lastUpdate: ev.time || ev.createdAt || "",
    };
  };

  const addAddress = async (addr: AddressType) => {
    const r = await api.post<{ addresses: AddressType[] }>("user/addresses", addr);
    setAddresses(r.data.addresses ?? []);
  };

  const updateAddress = async (index: number, addr: AddressType) => {
    const r = await api.put<{ addresses: AddressType[] }>("user/addresses", {
      index,
      ...addr,
    });
    setAddresses(r.data.addresses ?? []);
  };

  const deleteAddress = async (index: number) => {
    const r = await api.request<{ addresses: AddressType[] }>({
      url: "user/addresses",
      method: "DELETE",
      data: { index } as any,
    });
    setAddresses(r.data.addresses ?? []);
  };

  const uploadDocuments = async (files: File[]) => {
    for (const f of files) {
      const fd = new FormData();
      fd.append("file", f);

      const resp = await fetch("/api/user/documents", {
        method: "POST",
        body: fd,
      });

      if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e?.error || "Upload failed");
      }
    }

    await refetchDocuments();
  };

  const deleteDocument = async (filename: string) => {
    const r = await fetch(
      `/api/user/documents?filename=${encodeURIComponent(filename)}`,
      { method: "DELETE" }
    );
    if (!r.ok) throw new Error("Delete failed");
    await refetchDocuments();
  };

  return {
    loading,
    error,
    profile,
    packages,
    transactions,
    addresses,
    deals,
    notifications,
    documents,
    refetchPackages,
    refetchTransactions,
    refetchAddresses,
    refetchDocuments,
    saveProfile,
    changePassword,
    trackPackage,
    addAddress,
    updateAddress,
    deleteAddress,
    uploadDocuments,
    deleteDocument,
  };
}

// ---------- Modals ----------
type BasicModalProps = {
  show: boolean;
  onHide: () => void;
};

type ProfileModalProps = BasicModalProps & {
  profile: ProfileType | null;
  onSave: (data: Partial<ProfileType>) => Promise<void>;
};

function ProfileModal({ show, onHide, profile, onSave }: ProfileModalProps) {
  const [form, setForm] = useState<Partial<ProfileType>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show && profile) {
      setForm({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
      });
    }
    if (!show) setForm({});
  }, [show, profile]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FiUser className="me-2" />
          Edit Profile
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              await onSave(form);
              onHide();
            } finally {
              setSaving(false);
            }
          }}
        >
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={form.name ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />

          <Form.Label className="mt-2">Email</Form.Label>
          <Form.Control
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />

          <Form.Label className="mt-2">Phone</Form.Label>
          <Form.Control
            value={form.phone ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />

          <Button className="mt-3 w-100" type="submit" disabled={saving}>
            {saving ? <Spinner size="sm" /> : "Save Changes"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

type PassModalProps = BasicModalProps & {
  onChangePass: (cur: string, next: string) => Promise<void>;
};

function PassModal({ show, onHide, onChangePass }: PassModalProps) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!show) {
      setCur("");
      setNext("");
      setMsg("");
      setSaving(false);
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FiShield className="me-2" />
          Change Password
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              await onChangePass(cur, next);
              setMsg("Password updated.");
            } catch (e: any) {
              setMsg(e?.message || "Failed");
            } finally {
              setSaving(false);
            }
          }}
        >
          <Form.Label>Current Password</Form.Label>
          <Form.Control
            type="password"
            value={cur}
            onChange={(e) => setCur(e.target.value)}
            required
          />

          <Form.Label className="mt-2">New Password</Form.Label>
          <Form.Control
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
          />

          {msg && (
            <Alert
              className="mt-3"
              variant={msg.includes("updated") ? "success" : "danger"}
            >
              {msg}
            </Alert>
          )}

          <Button className="mt-3 w-100" type="submit" disabled={saving}>
            {saving ? <Spinner size="sm" /> : "Update Password"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

function SupportModal({ show, onHide }: BasicModalProps) {
  const [topic, setTopic] = useState("General");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!show) {
      setTopic("General");
      setMessage("");
      setSending(false);
      setMsg("");
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FiHelpCircle className="me-2" />
          Support
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            setSending(true);
            setMsg("");

            try {
              const res = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic, message }),
              });

              const data = await res.json().catch(() => ({}));

              if (!res.ok) {
                throw new Error(data?.error || "Failed to send support request");
              }

              setMsg("Your message has been sent successfully.");
              setMessage("");
            } catch (err: any) {
              setMsg(err?.message || "Failed to send support request");
            } finally {
              setSending(false);
            }
          }}
        >
          <Form.Label>Topic</Form.Label>
          <Form.Select value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option>General</option>
            <option>Billing</option>
            <option>Shipping</option>
            <option>Technical</option>
          </Form.Select>

          <Form.Label className="mt-3">Message</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          {msg && (
            <Alert
              className="mt-3"
              variant={msg.toLowerCase().includes("success") ? "success" : "info"}
            >
              {msg}
            </Alert>
          )}

          <Button className="mt-3 w-100" type="submit" disabled={sending}>
            {sending ? <Spinner size="sm" /> : "Send"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

type AddressModalProps = {
  show: boolean;
  onHide: () => void;
  initial?: AddressForm;
  onSave: (form: AddressForm) => Promise<void>;
  saving?: boolean;
  title?: string;
};

function AddressModal({
  show,
  onHide,
  initial,
  onSave,
  saving,
  title = "Add Address",
}: AddressModalProps) {
  const [form, setForm] = useState<AddressForm>({
    label: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  });

  useEffect(() => {
    setForm(
      initial ?? {
        label: "",
        address: "",
        city: "",
        country: "",
        postalCode: "",
      }
    );
  }, [initial, show]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            await onSave(form);
          }}
        >
          <Form.Label>Label</Form.Label>
          <Form.Control
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            required
          />

          <Form.Label className="mt-2">Address</Form.Label>
          <Form.Control
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            required
          />

          <Form.Label className="mt-2">City</Form.Label>
          <Form.Control
            value={form.city ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />

          <Form.Label className="mt-2">Country</Form.Label>
          <Form.Control
            value={form.country ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          />

          <Form.Label className="mt-2">Postal Code</Form.Label>
          <Form.Control
            value={form.postalCode ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, postalCode: e.target.value }))
            }
          />

          <Button type="submit" className="mt-3 w-100" disabled={!!saving}>
            {saving ? <Spinner size="sm" /> : "Save"}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

// ---------- Main Page ----------
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const {
    loading,
    error,
    profile,
    packages,
    transactions,
    addresses,
    deals,
    notifications,
    documents,
    refetchPackages,
    refetchTransactions,
    refetchAddresses,
    refetchDocuments,
    saveProfile,
    changePassword,
    trackPackage,
    addAddress,
    updateAddress,
    deleteAddress,
    uploadDocuments,
    deleteDocument,
  } = useDashboardData();

  const [showAI, setShowAI] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const [tracking, setTracking] = useState("");
  const [trackRes, setTrackRes] = useState<TrackResponse | null>(null);
  const [trackLoading, setTrackLoading] = useState(false);

  const [trackOpen, setTrackOpen] = useState(false);
  const [trackPkg, setTrackPkg] = useState<PackageType | null>(null);
  const [trackEvents, setTrackEvents] = useState<TrackingEvent[]>([]);
  const [trackBusy, setTrackBusy] = useState(false);

  const [docUploading, setDocUploading] = useState(false);

  const [addrModalOpen, setAddrModalOpen] = useState(false);
  const [addrEditingIndex, setAddrEditingIndex] = useState<number | null>(null);
  const [addrInitial, setAddrInitial] = useState<AddressForm | undefined>(undefined);
  const [addrSaving, setAddrSaving] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const prettyStatus = (s?: string) => {
    if (!s) return "";
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const loadTrack = async (trackingNo: string) => {
    setTrackBusy(true);
    try {
      const r = await fetch(`/api/track?trackingNo=${encodeURIComponent(trackingNo)}`);
      const data = await r.json().catch(() => ({} as any));

      if (!r.ok || data.ok === false) {
        throw new Error(data.error || "Failed to load events");
      }

      setTrackEvents(Array.isArray(data.events) ? data.events : []);
      setTrackPkg(data.package ?? null);
    } catch (e: any) {
      setTrackEvents([]);
      alert(e?.message || "Failed to load tracking");
    } finally {
      setTrackBusy(false);
    }
  };

  const openTrackModal = (p: PackageType) => {
    setTrackPkg(p);
    setTrackOpen(true);
    loadTrack(p.tracking);
  };

  const onDrop = async (files: File[]) => {
    if (!files.length) return;

    setDocUploading(true);
    try {
      await uploadDocuments(files);
    } catch (e: any) {
      alert(e?.message || "Upload failed");
    } finally {
      setDocUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const saveAddress = async (form: AddressForm) => {
    setAddrSaving(true);
    try {
      if (addrEditingIndex === null) {
        await addAddress(form);
      } else {
        await updateAddress(addrEditingIndex, form);
      }
      await refetchAddresses();
      setAddrModalOpen(false);
    } finally {
      setAddrSaving(false);
    }
  };

  const doTrack = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tracking.trim()) return;

    setTrackLoading(true);
    try {
      const res = await trackPackage(tracking.trim());
      setTrackRes(res);
    } catch {
      setTrackRes({ tracking, status: "Not found" });
    } finally {
      setTrackLoading(false);
    }
  };

  const virtualAddress = `CrossBorderCart Warehouse (Mamzar Onyx Tower)
${profile?.suiteId ? `Suite ${profile.suiteId}` : "Suite —"}
Mamzar / Dubai, UAE
+971-52-535-0353`;

  if (status === "loading" || loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: LIGHT_BG }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          background: "#fff",
          borderBottom: "1px solid #e8eef0",
        }}
      >
        <Container fluid className="py-2">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <Image src="/logo-cart.svg" alt="logo" width={36} height={36} />
              <h5 className="mb-0 d-none d-sm-block" style={{ color: MAIN_COLOR, fontWeight: 800 }}>
                CrossBorderCart
              </h5>
              <Badge bg="light" text="dark" className="d-none d-md-inline">
                Dashboard
              </Badge>
            </div>

            <div className="d-flex align-items-center gap-2 ms-auto">
              <Form onSubmit={doTrack} className="d-none d-md-flex">
                <InputGroup>
                  <Form.Control
                    placeholder="Track package #"
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                  />
                  <Button type="submit" variant="outline-secondary" disabled={trackLoading}>
                    {trackLoading ? <Spinner size="sm" /> : <FiSearch />}
                  </Button>
                </InputGroup>
              </Form>

              <Dropdown show={notifOpen} onToggle={(v) => setNotifOpen(Boolean(v))} align="end">
                <Dropdown.Toggle as="button" className="btn btn-light position-relative">
                  <FiBell />
                  {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {unreadCount}
                    </span>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu style={{ minWidth: 320 }}>
                  <Dropdown.Header>Notifications</Dropdown.Header>
                  {notifications.length === 0 ? (
                    <span className="dropdown-item-text text-muted">No notifications.</span>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <div key={n.id} className="dropdown-item-text">
                        <div className="fw-semibold">{n.title}</div>
                        <div className="small text-muted">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                        <div className="small">{n.body}</div>
                        <hr className="my-1" />
                      </div>
                    ))
                  )}
                </Dropdown.Menu>
              </Dropdown>

              {(profile?.role === "admin" || profile?.role === "superadmin") && (
                <a
                  href="/admin/dashboard"
                  className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
                >
                  <FiSettings />
                  <span className="d-none d-sm-inline">Switch to Admin</span>
                </a>
              )}
<a
  href="/dashboard/my-shipments"
  className="btn btn-outline-success d-inline-flex align-items-center gap-2"
>
  <FiTruck />
  <span className="d-none d-sm-inline">My Shipments</span>
</a>

<a
  href="/charges"
  className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
>
  <FiFileText />
  <span className="d-none d-sm-inline">My Invoices</span>
</a>

              <a
                href="/charges"
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-2"
              >
                <FiFileText />
                <span className="d-none d-sm-inline">My Invoices</span>
              </a>

              <button
                type="button"
                className="btn btn-outline-danger d-inline-flex align-items-center gap-2"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <FiLogOut />
                <span className="d-none d-sm-inline">Logout</span>
              </button>
            </div>
          </div>
        </Container>
      </header>

      <div style={{ background: CARD_GRADIENT, borderBottom: "1px solid #eaf4f5" }}>
        <Container className="py-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between">
            <div>
              <div className="text-muted small">Welcome back</div>
              <h4 className="mb-1" style={{ color: DARK, fontWeight: 800 }}>
                {profile?.name || session?.user?.name || "User"}
                {profile?.suiteId ? ` · Suite ${profile.suiteId}` : ""}
              </h4>
              <div className="small">
                Membership:{" "}
                <Badge bg="success" style={{ background: MAIN_COLOR }}>
                  {profile?.membership || "Free"}
                </Badge>
              </div>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <Button variant="outline-secondary" onClick={() => setShowSupport(true)}>
                <FiMessageSquare className="me-1" />
                Support
              </Button>

              <Button variant="outline-secondary" onClick={() => setShowAI(true)}>
                AI Assistant
              </Button>

              <Button variant="outline-secondary" onClick={() => setShowProfile(true)}>
                <FiUser className="me-1" />
                Edit Profile
              </Button>

              <Button variant="outline-secondary" onClick={() => setShowPass(true)}>
                <FiShield className="me-1" />
                Password
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="g-3">
          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small">Packages</div>
                    <h5 className="mb-0">{packages.length}</h5>
                  </div>
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 44, height: 44, background: CHIP_BG }}
                  >
                    <FiPackage color={MAIN_COLOR} />
                  </div>
                </div>
                <div className="mt-2 small text-muted">
                  Latest: {packages[0]?.tracking || "—"}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small">Transactions</div>
                    <h5 className="mb-0">{transactions.length}</h5>
                  </div>
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 44, height: 44, background: CHIP_BG }}
                  >
                    <FiFileText color={MAIN_COLOR} />
                  </div>
                </div>
                <div className="mt-2 small text-muted">
                  Latest: {transactions[0] ? `${transactions[0].amount} AED` : "—"}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small">Addresses</div>
                    <h5 className="mb-0">{addresses.length}</h5>
                  </div>
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: 44, height: 44, background: CHIP_BG }}
                  >
                    <FiHome color={MAIN_COLOR} />
                  </div>
                </div>
                <div className="mt-2 small text-muted">Manage delivery details</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 16 }}>
          <TrackingSearchCard initialTrackingNo="" />
        </div>

        <Form onSubmit={doTrack} className="d-md-none mt-3">
          <InputGroup>
            <Form.Control
              placeholder="Track package #"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
            <Button type="submit" variant="outline-secondary" disabled={trackLoading}>
              {trackLoading ? <Spinner size="sm" /> : <FiSearch />}
            </Button>
          </InputGroup>

          {trackRes && (
            <Alert className="mt-2" variant="light">
              <div>
                <strong>{trackRes.tracking}</strong> — {prettyStatus(trackRes.status)}
              </div>
              {trackRes.location && <div>Location: {trackRes.location}</div>}
              {trackRes.lastUpdate && (
                <div>Updated: {new Date(trackRes.lastUpdate).toLocaleString()}</div>
              )}
            </Alert>
          )}
        </Form>

        <Row className="g-3 mt-1">
          <Col lg={8}>
            <Card className="shadow-sm">
              <Card.Header style={{ background: "white" }}>
                <strong>
                  <FiTruck className="me-1" />
                  My Packages
                </strong>
              </Card.Header>
              <Card.Body>
                {packages.length === 0 ? (
                  <div className="text-muted">No packages yet.</div>
                ) : (
                  <Table hover responsive>
                    <thead>
                      <tr>
                        <th>Tracking</th>
                        <th>Status</th>
                        <th>Value</th>
                        <th>Last Updated</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packages.slice(0, 8).map((p, idx) => (
                        <tr key={p._id || `${p.tracking}-${idx}`}>
                          <td>
  <div>
    <strong>Package:</strong> {p.tracking || "—"}
  </div>
  <div style={{ color: "#0f766e", fontSize: 14 }}>
    <strong>Shipment:</strong> {p.shipmentTracking || "Not created yet"}
  </div>
</td>
                          <td>
                            <Badge bg="light" text="dark">
                              {prettyStatus(p.status)}
                            </Badge>
                          </td>
                          <td>{p.value} AED</td>
                          <td>{new Date(p.updatedAt).toLocaleString()}</td>
                          <td>
                            {!p.isPaid && p.shipmentTracking && (
  <div style={{ color: "#e53935", fontSize: 12 }}>
    🔒 Payment required
  </div>
)}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
  <Button
    size="sm"
    variant="outline-primary"
    onClick={() => openTrackModal(p)}
  >
    Track Package
  </Button>

  {p.shipmentTracking && (
    <Button
      size="sm"
      variant="outline-success"
      onClick={() =>
        openTrackModal({
          ...p,
          tracking: p.shipmentTracking || p.tracking,
        })
      }
    >
      Track Shipment
    </Button>
    
  )}
{p.shipmentTracking && !p.isPaid && (
  <Button
  size="sm"
  variant="success"
  onClick={async () => {
    const res = await fetch(`/api/me/pay-package?packageId=${p._id}`);
    const data = await res.json();

    if (!res.ok || !data.ok) {
      alert(data.error || "Payment link is not ready yet.");
      return;
    }

    if (data.paid) {
      alert("This shipment is already paid.");
      return;
    }

    window.open(data.checkoutUrl, "_blank");
  }}
>
  Pay Now
</Button>
)}

</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}

                <div className="d-flex gap-2 flex-wrap">
  <Button
    size="sm"
    variant="outline-secondary"
    onClick={refetchPackages}
  >
    Refresh
  </Button>

  <a
    href="/mypackages"
    className="btn btn-sm btn-outline-primary"
  >
    View all packages
  </a>

  <a
    href="/dashboard/my-shipments"
    className="btn btn-sm btn-success"
  >
    <FiTruck className="me-1" />
    My Shipments
  </a>
</div>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mt-3">
              <Card.Header style={{ background: "white" }}>
                <strong>Billing</strong>
              </Card.Header>
              <Card.Body>
                <BillingSummary />
                <div className="mt-3">
                  <OutstandingInvoicesCard />
                </div>
                <div className="mt-3 d-flex gap-2">
                  <Button size="sm" variant="outline-secondary" onClick={refetchTransactions}>
                    Refresh
                  </Button>
                  <a href="/charges" className="btn btn-sm btn-outline-primary">
                    View invoices
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm">
              <Card.Header style={{ background: "white" }}>
                <strong>
                  <FiMapPin className="me-1" />
                  UAE Virtual Address
                </strong>
              </Card.Header>
              <Card.Body>
                <pre
                  style={{
                    background: "#f3f7f7",
                    padding: 12,
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  {virtualAddress}
                </pre>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => navigator.clipboard.writeText(virtualAddress)}
                >
                  Copy Address
                </Button>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mt-3">
              <Card.Header style={{ background: "white" }}>
                <strong>
                  <FiHome className="me-1" />
                  Address Book
                </strong>
              </Card.Header>
              <Card.Body>
                {addresses.length === 0 ? (
                  <div className="text-muted">No addresses yet.</div>
                ) : (
                  <div className="d-grid gap-2">
                    {addresses.map((a, idx) => (
                      <Card key={`${a.label}-${idx}`} className="border">
                        <Card.Body className="py-2">
                          <div className="fw-semibold">{a.label}</div>
                          <div className="small text-muted">
                            {a.address}
                            {a.city ? `, ${a.city}` : ""}
                            {a.country ? `, ${a.country}` : ""}
                            {a.postalCode ? `, ${a.postalCode}` : ""}
                          </div>
                          <div className="mt-2 d-flex gap-2">
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => {
                                setAddrEditingIndex(idx);
                                setAddrInitial({
                                  label: a.label,
                                  address: a.address,
                                  city: a.city,
                                  country: a.country,
                                  postalCode: a.postalCode,
                                });
                                setAddrModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => {
                                if (confirm("Delete this address?")) {
                                  deleteAddress(idx).then(refetchAddresses);
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}

                <Button
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setAddrEditingIndex(null);
                    setAddrInitial(undefined);
                    setAddrModalOpen(true);
                  }}
                >
                  Add Address
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col lg={7}>
            <Card className="shadow-sm">
              <Card.Header style={{ background: "white" }}>
                <strong>
                  <FiUpload className="me-1" />
                  Documents
                </strong>
              </Card.Header>
              <Card.Body>
                <div
                  {...getRootProps()}
                  style={{
                    border: `2px dashed ${MAIN_COLOR}`,
                    borderRadius: 10,
                    padding: 16,
                    textAlign: "center",
                    background: isDragActive ? "#ecfeff" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <input {...getInputProps()} />
                  <div className="text-muted">
                    Drag and drop files here, or click to upload
                  </div>
                </div>

                {docUploading && (
                  <div className="mt-2">
                    <Spinner size="sm" /> Uploading...
                  </div>
                )}

                <div className="d-flex align-items-center justify-content-between mt-3">
                  <strong>Your Documents</strong>
                  <Button size="sm" variant="outline-secondary" onClick={refetchDocuments}>
                    Refresh
                  </Button>
                </div>

                {documents.length === 0 ? (
                  <div className="text-muted mt-2">No documents yet.</div>
                ) : (
                  <Table hover responsive size="sm" className="mt-2">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Uploaded</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((d) => (
                        <tr key={d.filename}>
                          <td>
                            {d.url ? (
                              <a href={d.url} target="_blank" rel="noreferrer">
                                {d.label || d.filename}
                              </a>
                            ) : (
                              d.label || d.filename
                            )}
                          </td>
                          <td>
                            {d.uploadedAt ? new Date(d.uploadedAt).toLocaleString() : "—"}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              {d.url && (
                                <a
                                  className="btn btn-sm btn-outline-secondary"
                                  href={d.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open
                                </a>
                              )}
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => deleteDocument(d.filename)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="shadow-sm">
              <Card.Header style={{ background: "white" }}>
                <strong>
                  <FiShoppingBag className="me-1" />
                  Top Stores
                </strong>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  {[
                    { name: "Amazon AE", logo: "/amazon.svg", url: "https://amazon.ae", tag: "Everything" },
                    { name: "Noon", logo: "/noon.svg", url: "https://noon.com", tag: "Deals" },
                    { name: "eBay", logo: "/ebay.svg", url: "https://ebay.com", tag: "Auctions" },
                    { name: "Walmart", logo: "/walmart.svg", url: "https://walmart.com", tag: "Value" },
                  ].map((s) => (
                    <Col sm={6} key={s.name}>
                      <Card
                        className="h-100 border-0"
                        style={{ background: "#fff", boxShadow: "0 8px 24px #0000000d" }}
                      >
                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex align-items-center justify-content-between">
                            <Image
                              src={s.logo}
                              alt={s.name}
                              height={28}
                              onError={(e: any) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                            <Badge bg="light" text="dark">
                              {s.tag}
                            </Badge>
                          </div>

                          <div className="mt-2 fw-bold">{s.name}</div>

                          <div className="mt-auto">
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-decoration-none"
                            >
                              <span style={{ color: MAIN_COLOR }}>
                                Shop now <FiChevronRight />
                              </span>
                            </a>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>

            <Card className="shadow-sm mt-3">
              <Card.Header style={{ background: "white" }}>
                <strong>Hot Deals</strong>
              </Card.Header>
              <Card.Body>
                {deals.length === 0 ? (
                  <div className="text-muted">No deals available.</div>
                ) : (
                  <ul className="list-group">
                    {deals.slice(0, 5).map((d) => (
                      <li
                        key={d.id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <span>
                          <strong>{d.store}</strong> — {d.title}
                          {d.discountText && (
                            <Badge bg="success" className="ms-2">
                              {d.discountText}
                            </Badge>
                          )}
                        </span>
                        <a href={d.url} target="_blank" rel="noreferrer">
                          <FiChevronRight />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <SiteFooter />

      <ProfileModal
        show={showProfile}
        onHide={() => setShowProfile(false)}
        profile={profile}
        onSave={saveProfile}
      />

      <PassModal
        show={showPass}
        onHide={() => setShowPass(false)}
        onChangePass={changePassword}
      />

      <SupportModal
        show={showSupport}
        onHide={() => setShowSupport(false)}
      />

      <AIChatbotModal
        open={showAI}
        onClose={() => setShowAI(false)}
        userContext={{
          name: profile?.name,
          email: profile?.email,
          suiteId: profile?.suiteId,
          membership: profile?.membership,
        }}
      />

      <AddressModal
        show={addrModalOpen}
        onHide={() => setAddrModalOpen(false)}
        initial={addrInitial}
        onSave={saveAddress}
        saving={addrSaving}
        title={addrEditingIndex === null ? "Add Address" : "Edit Address"}
      />

      <Modal show={trackOpen} onHide={() => setTrackOpen(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiTruck className="me-2" />
            Package Tracking
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {trackBusy ? (
            <div className="d-flex justify-content-center py-4">
              <Spinner />
            </div>
          ) : (
            <>
            <Card className="mb-3 border-0 bg-light">
  <Card.Body>
    <Row className="g-3">
      <Col md={4}>
        <div className="text-muted small">📦 Received</div>
        <div className="fw-semibold">
          {trackPkg?.receivedAt ? new Date(trackPkg.receivedAt).toLocaleString() : "—"}
        </div>
      </Col>
      <Col md={4}>
        <div className="text-muted small">🚚 Shipped</div>
        <div className="fw-semibold">
          {trackPkg?.shippedAt ? new Date(trackPkg.shippedAt).toLocaleString() : "—"}
        </div>
      </Col>
      <Col md={4}>
        <div className="text-muted small">✅ Delivered</div>
        <div className="fw-semibold">
          {trackPkg?.deliveredAt ? new Date(trackPkg.deliveredAt).toLocaleString() : "—"}
        </div>
      </Col>
    </Row>
  </Card.Body>
</Card>
              <div className="mb-3">
                <strong>Tracking:</strong> {trackPkg?.tracking || "—"}
              </div>
              <TrackingTimeline events={trackEvents} />
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}