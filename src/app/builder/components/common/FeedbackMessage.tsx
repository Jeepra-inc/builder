"use client";
import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeedbackMessageProps {
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
  show: boolean;
  onClose: () => void;
}

export function FeedbackMessage({
  message,
  type,
  duration = 3000,
  show,
  onClose,
}: FeedbackMessageProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-white" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-white" />;
      case "info":
        return <AlertCircle className="h-5 w-5 text-white" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-emerald-600";
      case "error":
        return "bg-red-600";
      case "info":
        return "bg-blue-600";
      default:
        return "bg-gray-800";
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className={`flex items-center p-3 px-4 rounded-md shadow-lg ${getBackgroundColor()}`}>
            <div className="mr-3">{getIcon()}</div>
            <div className="text-white font-medium">{message}</div>
            <button
              onClick={onClose}
              className="ml-3 text-white/70 hover:text-white transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Usage example:
// const [showFeedback, setShowFeedback] = useState(false);
// const [feedbackMessage, setFeedbackMessage] = useState("");
// const [feedbackType, setFeedbackType] = useState<"success" | "error" | "info">("success");
//
// <FeedbackMessage 
//   message={feedbackMessage}
//   type={feedbackType}
//   show={showFeedback} 
//   onClose={() => setShowFeedback(false)} 
// />
