import { mount, Seidr, Switch } from "@fimbul-works/seidr";
import { $div } from "@fimbul-works/seidr/html";
import { beforeEach, describe, expect, test } from "vitest";

describe("docs/Switch.md Examples", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("Switch Example", () => {
    const status = new Seidr("loading");

    const StatusPage = () => {
      return $div({}, [
        Switch(
          status,
          {
            loading: () => $div({ textContent: "Loading..." }),
            success: () => $div({ textContent: "Data loaded!" }),
            error: () => $div({ textContent: "Error occurred" }),
          },
          () => $div({ textContent: "Unknown status" }),
        ),
      ]);
    };

    mount(StatusPage, document.body);
    expect(document.body.textContent).toContain("Loading...");

    status.value = "success";
    expect(document.body.textContent).toContain("Data loaded!");

    status.value = "error";
    expect(document.body.textContent).toContain("Error occurred");

    status.value = "unknown";
    expect(document.body.textContent).toContain("Unknown status");
  });
});
