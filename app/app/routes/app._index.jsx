import { useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { readChartStatus } from "../size-chart.server.js";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const { customized } = await readChartStatus(admin);

  // Link the "Try it" step to a real product page when we can read one.
  // Reading a product needs read_products; if it's missing or the store has no
  // products, fall back to the all-products page so the step never breaks.
  let testUrl = `https://${session.shop}/collections/all`;
  try {
    const res = await admin.graphql(
      `#graphql
      query FirstProduct { products(first: 1) { nodes { onlineStoreUrl } } }`,
    );
    const url = (await res.json())?.data?.products?.nodes?.[0]?.onlineStoreUrl;
    if (url) testUrl = url;
  } catch {
    // read_products not granted yet — keep the fallback URL.
  }

  return { customized, testUrl };
};

export default function Index() {
  const { customized, testUrl } = useLoaderData();
  const navigate = useNavigate();
  const goEdit = () => navigate("/app/size-chart");

  return (
    <s-page heading="Fit Confidence">
      <s-button slot="primary-action" onClick={goEdit}>
        Edit size chart
      </s-button>

      <s-section heading="Get started">
        <s-paragraph>
          Help shoppers pick the right size the first time and cut wrong-size
          returns. Three steps to go live:
        </s-paragraph>

        <s-stack direction="block" gap="large">
          <s-stack direction="block" gap="small-200">
            <s-stack direction="inline" gap="base" alignItems="center">
              <s-text type="strong">1. Set your size chart</s-text>
              {customized ? (
                <s-badge tone="success">Customized</s-badge>
              ) : (
                <s-badge>Using default chart</s-badge>
              )}
            </s-stack>
            <s-paragraph>
              Shoppers get S / M / L / XL from these height and weight ranges.
            </s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-button onClick={goEdit}>Edit size chart</s-button>
            </s-stack>
          </s-stack>

          <s-stack direction="block" gap="small-200">
            <s-text type="strong">2. Add the Size Finder widget</s-text>
            <s-paragraph>
              In your theme editor, open a product page and add the “Size
              Finder” app block (Online Store → Customize → Add block).
            </s-paragraph>
          </s-stack>

          <s-stack direction="block" gap="small-200">
            <s-text type="strong">3. Try it on your storefront</s-text>
            <s-paragraph>
              Open a product page and use “Find my size” to see the
              recommendation.
            </s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-button href={testUrl} target="_blank" variant="secondary">
                Try it on your storefront
              </s-button>
            </s-stack>
          </s-stack>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="How it works">
        <s-paragraph>
          The chart is stored in an app-owned shop metafield —{" "}
          <s-text type="strong">$app:fit_confidence.size_chart</s-text>, no
          database. The storefront widget reads it and falls back to a built-in
          default when empty, so it never breaks. The recommendation logic is
          rule-based and unit-tested — no AI guessing, no shopper data leaves the
          page.
        </s-paragraph>
      </s-section>

      <s-section slot="aside" heading="What's next">
        <s-unordered-list>
          <s-list-item>Per-product and per-collection size charts</s-list-item>
          <s-list-item>Unit switch (inch / cm) with auto-detect by region</s-list-item>
          <s-list-item>Analytics — how much the widget cuts returns</s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
