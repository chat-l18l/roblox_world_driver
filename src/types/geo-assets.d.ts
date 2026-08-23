declare module "world-atlas/countries-110m.json" {
  const value: import("topojson-specification").Topology<{
    countries: import("topojson-specification").GeometryCollection;
  }>;
  export default value;
}
