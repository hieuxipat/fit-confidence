import { useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <s-page heading="Fit Confidence — Size Finder">
      <s-button
        slot="primary-action"
        onClick={() => navigate("/app/size-chart")}
      >
        Edit size chart
      </s-button>

      <s-section heading="Help shoppers pick the right size">
        <s-paragraph>
          Fit Confidence adds a “Find my size” widget to your storefront. A
          shopper enters their height, weight and fit preference, and the widget
          recommends S / M / L / XL from your size chart — reducing wrong-size
          orders and returns.
        </s-paragraph>
        <s-paragraph>
          The recommendation logic is rule-based and unit-tested; no AI guessing
          and no shopper data leaves the page.
        </s-paragraph>
      </s-section>

      <s-section heading="Set up">
        <s-unordered-list>
          <s-list-item>
            Edit your S/M/L/XL ranges on the{" "}
            <s-link href="/app/size-chart">Size chart</s-link> page. They are
            saved to your shop and used by the storefront widget.
          </s-list-item>
          <s-list-item>
            Add the <s-text type="strong">Size Finder</s-text> app block to a
            product page in your theme editor (Online Store → Customize → add
            block).
          </s-list-item>
        </s-unordered-list>
        <s-stack direction="inline" gap="base">
          <s-button onClick={() => navigate("/app/size-chart")}>
            Edit size chart
          </s-button>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="How it works">
        <s-paragraph>
          The size chart is stored in an app-owned shop metafield
          (<s-text type="strong">$app:fit_confidence.size_chart</s-text>) — no
          database. The storefront widget reads it in Liquid and falls back to a
          built-in default when empty, so it never breaks.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
