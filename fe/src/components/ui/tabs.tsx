import React, { useState } from "react";

export function Tabs({ children }) {
  return <div className="tabs">{children}</div>;
}

export function TabsList({ children }) {
  return <div className="tabs-list">{children}</div>;
}

export function TabsTrigger({ children, onClick }) {
  return <button onClick={onClick} className="tab-trigger">{children}</button>;
}

export function TabsContent({ children }) {
  return <div className="tabs-content">{children}</div>;
}
