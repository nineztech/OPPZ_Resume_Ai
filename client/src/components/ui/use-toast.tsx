import * as React from "react";
import { type ToastProps } from "./toast";
import { ToastAction } from "./toast";

type ToastActionElement = React.ReactElement<typeof ToastAction>;

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const dispatchRef = React.createRef<React.Dispatch<any>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) return;

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    if (dispatchRef.current) {
      dispatchRef.current({ type: "REMOVE_TOAST", toastId });
    }
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

const toastReducer = (
  state: ToasterToast[],
  action: {
    type: keyof typeof actionTypes;
    toast?: ToasterToast;
    toastId?: ToasterToast["id"];
  }
) => {
  switch (action.type) {
    case "ADD_TOAST":
      return [action.toast!, ...state].slice(0, TOAST_LIMIT);
    case "UPDATE_TOAST":
      return state.map((t) =>
        t.id === action.toast!.id ? { ...t, ...action.toast } : t
      );
    case "DISMISS_TOAST":
      addToRemoveQueue(action.toastId!);
      return state.map((t) =>
        t.id === action.toastId || action.toastId === undefined
          ? { ...t, open: false }
          : t
      );
    case "REMOVE_TOAST":
      return state.filter((t) => t.id !== action.toastId);
    default:
      return state;
  }
};

const ToastContext = React.createContext<{
  toasts: ToasterToast[];
  dispatch: React.Dispatch<any>;
  addToast: (toast: ToastProps) => void;
  updateToast: (toast: Partial<ToasterToast>) => void;
  dismissToast: (toastId?: string) => void;
} | null>(null);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(toastReducer, []);
  
  // Set the global dispatch reference
  React.useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  const addToast = React.useCallback(
    (toast: ToastProps) => {
      const id = genId();
      dispatch({
        type: "ADD_TOAST",
        toast: {
          ...toast,
          id,
          open: true,
        },
      });
      return id;
    },
    [dispatch]
  );

  const updateToast = React.useCallback(
    (toast: Partial<ToasterToast>) => {
      if (toast.id) {
        dispatch({ type: "UPDATE_TOAST", toast: toast as ToasterToast });
      }
    },
    [dispatch]
  );

  const dismissToast = React.useCallback(
    (toastId?: string) =>
      dispatch({ type: "DISMISS_TOAST", toastId }),
    [dispatch]
  );

  return (
    <ToastContext.Provider
      value={{ toasts: state, addToast, updateToast, dismissToast, dispatch }}
    >
      {children}
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return {
    toast: context.addToast,
    dismiss: context.dismissToast,
    toasts: context.toasts,
  };
}

export { ToastProvider, useToast };
