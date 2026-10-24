import { MultilayerIjump } from "algos/multi-layer-ijump/MultilayerIjump"
import { getDebugSvg } from "algos/infinite-grid-ijump-astar/tests/fixtures/get-debug-svg"
import { test, expect } from "bun:test"

const minimalRepro = {
  layerCount: 2,
  minTraceWidth: 0.15,
  obstacles: [
    {
      type: "rect" as const,
      layers: ["top"],
      center: { x: 0.25, y: -17.55 },
      width: 1.0,
      height: 1.0,
      connectedTo: [],
    },
    {
      type: "rect" as const,
      layers: ["top"],
      center: { x: 1.0875, y: -15 },
      width: 1.025,
      height: 1.4,
      connectedTo: [],
    },
    {
      type: "rect" as const,
      layers: ["top"],
      center: { x: 2.0, y: -13.6 },
      width: 2.5,
      height: 1.4,
      connectedTo: [],
    },
    {
      type: "rect" as const,
      layers: ["top"],
      center: { x: 3.25, y: -15 },
      width: 1.0,
      height: 4.0,
      connectedTo: [],
    },
  ],
  connections: [
    {
      name: "trace_1",
      pointsToConnect: [
        { x: 1.8, y: -17.55, layer: "top" },
        { x: -5.51, y: -12, layer: "top" },
      ],
    },
  ],
  bounds: { minX: -7, maxX: 5, minY: -19, maxY: -10 },
}

test("repro3: multilayer ijump removes wild trace jump when sub-grid-step move hits obstacle margin", () => {
  const autorouter = new MultilayerIjump({
    input: minimalRepro,
    isRemovePathLoopsEnabled: true,
    isShortenPathWithShortcutsEnabled: true,
    debug: true,
  })

  const solution = autorouter.solveAndMapToTraces()
  expect(solution).toHaveLength(1)

  const route = solution[0].route
  // Ensure the trace does not jump up to y = -15.3 and back down to y = -16.7
  const yCoords = route.map((p: any) => p.y)
  for (let i = 1; i < yCoords.length; i++) {
    expect(yCoords[i]).toBeGreaterThanOrEqual(yCoords[i - 1])
  }

  expect(
    getDebugSvg({
      inputCircuitJson: [],
      autorouter,
      solution,
      rowHeight: 15,
      colWidth: 15,
      colCount: 6,
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})
