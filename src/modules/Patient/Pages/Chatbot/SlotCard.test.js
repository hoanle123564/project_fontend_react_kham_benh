import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SlotCard from "./SlotCard";

describe("SlotCard read-only availability", () => {
  it("does not render a booking selection button", () => {
    const markup = renderToStaticMarkup(
      <SlotCard
        slot={{ id: 7, date: "2026-08-12", start_time: "08:00", end_time: "08:30" }}
        index={0}
        disabled
        readOnly
      />
    );

    expect(markup).not.toContain("<button");
    expect(markup).toContain("chatbot-option-readonly");
  });
});
