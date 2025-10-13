import "@testing-library/jest-dom/vitest";
import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// this mock makes sure any components using the translate hook can use it without a warning being shown
vi.mock("react-i18next", () => ({
  useTranslation: () => {
    return {
      t: (i18nKey: string) => i18nKey,
      i18n: {
        changeLanguage: () => new Promise(() => { }),
      },
    };
  },
  initReactI18next: {
    type: "3rdParty",
    init: () => { },
  }
}));

vi.mock("react-router-dom", async () => {
  const nav = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...nav,
    useNavigate: () => { return (link: string) => { return link; }; },
  };
});

// TODO: mock authorization?
// vi.mock("@/hooks/auth/useAuth", async () => {
//     return {
//         useAuth: vi.fn(),
//     };
// }); 

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || "mouse";
  }
}

window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
