import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { googleMapsUrl, locationLabel, type PropertyLocation } from "./googleMaps.ts";

const noLocation: PropertyLocation = {
  latitude: null,
  longitude: null,
  address: null,
  city: null,
  region: null,
};

describe("googleMapsUrl", () => {
  test("links by coordinates when the agent dropped a pin", () => {
    assert.equal(
      googleMapsUrl({
        latitude: -1.2921,
        longitude: 36.8219,
        address: "123 Kenyatta Ave",
        city: "Nairobi",
        region: "Nairobi County",
      }),
      "https://www.google.com/maps/search/?api=1&query=-1.2921,36.8219",
    );
  });

  test("links by coordinates even when no text was supplied", () => {
    assert.equal(
      googleMapsUrl({ latitude: -1.2921, longitude: 36.8219 }),
      "https://www.google.com/maps/search/?api=1&query=-1.2921,36.8219",
    );
  });

  test("honours a zero coordinate rather than treating it as missing", () => {
    assert.equal(
      googleMapsUrl({ ...noLocation, latitude: 0, longitude: 0 }),
      "https://www.google.com/maps/search/?api=1&query=0,0",
    );
  });

  test("falls back to a text query when there is no pin", () => {
    assert.equal(
      googleMapsUrl({
        latitude: null,
        longitude: null,
        address: "123 Kenyatta Ave",
        city: "Nairobi",
        region: "Nairobi County",
      }),
      "https://www.google.com/maps/search/?api=1&query=123%20Kenyatta%20Ave%2C%20Nairobi%2C%20Nairobi%20County%2C%20Kenya",
    );
  });

  test("skips missing parts of the text query", () => {
    assert.equal(
      googleMapsUrl({ ...noLocation, city: "Nakuru" }),
      "https://www.google.com/maps/search/?api=1&query=Nakuru%2C%20Kenya",
    );
  });

  test("falls back to text when only one coordinate is present", () => {
    assert.equal(
      googleMapsUrl({ ...noLocation, latitude: -1.2921, city: "Nairobi" }),
      "https://www.google.com/maps/search/?api=1&query=Nairobi%2C%20Kenya",
    );
  });

  test("falls back to text when a coordinate is not a real number", () => {
    assert.equal(
      googleMapsUrl({ ...noLocation, latitude: Number.NaN, longitude: 36.8219, city: "Nairobi" }),
      "https://www.google.com/maps/search/?api=1&query=Nairobi%2C%20Kenya",
    );
    assert.equal(
      googleMapsUrl({ ...noLocation, latitude: Number.POSITIVE_INFINITY, longitude: 36.8219, city: "Nairobi" }),
      "https://www.google.com/maps/search/?api=1&query=Nairobi%2C%20Kenya",
    );
  });

  test("has nothing to link when there is no location at all", () => {
    assert.equal(googleMapsUrl(noLocation), null);
  });

  test("treats whitespace-only location text as missing", () => {
    assert.equal(googleMapsUrl({ ...noLocation, address: "   ", city: "  " }), null);
  });
});

describe("locationLabel", () => {
  test("joins the street address and the city", () => {
    assert.equal(
      locationLabel({ ...noLocation, address: "123 Kenyatta Ave", city: "Nairobi" }),
      "123 Kenyatta Ave, Nairobi",
    );
  });

  test("does not leave a dangling separator when the address is missing", () => {
    assert.equal(locationLabel({ ...noLocation, city: "Nairobi" }), "Nairobi");
  });

  test("shows the street address alone when there is no city", () => {
    assert.equal(locationLabel({ ...noLocation, address: "123 Kenyatta Ave" }), "123 Kenyatta Ave");
  });

  test("leaves region out of the visible label", () => {
    assert.equal(locationLabel({ ...noLocation, region: "Nairobi County" }), "");
  });

  test("is empty when there is no location at all", () => {
    assert.equal(locationLabel(noLocation), "");
  });

  test("trims surrounding whitespace so the label never looks ragged", () => {
    assert.equal(
      locationLabel({ ...noLocation, address: "  123 Kenyatta Ave ", city: " Nairobi  " }),
      "123 Kenyatta Ave, Nairobi",
    );
  });
});
