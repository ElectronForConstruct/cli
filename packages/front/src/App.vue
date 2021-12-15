<template>
  <div style="height: 100vh; width: 100vw">
    <baklava-editor :plugin="viewPlugin" />
    <div class="calculate-wrapper">
      <button class="calculate-button" @click="calculate">Calculate</button>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-restricted-syntax */
import { defineComponent } from 'vue';
import { Editor } from '@baklavajs/core';
import { ViewPlugin } from '@baklavajs/plugin-renderer-vue3';
import { OptionPlugin } from '@baklavajs/plugin-options-vue3';
import { Engine } from '@baklavajs/plugin-engine';
import {
  itch, INPUT_FOLDER, API_KEY, CHANNEL, PROJECT, OUTPUT_FOLDER,
} from '@cyn/plugin-itch';
import { Dev, INPUT_FOLDER as ElectronInputFolder, OUTPUT_FOLDER as ElectronOutputFolder } from '@cyn/plugin-electron';
import { String, OPTION_VALUE, OUTPUT_VALUE } from './nodes/String';
import { Path } from './nodes/Path';
import { OUTPUT_FLOW, INPUT_FLOW } from './nodes/Action';
import { Log, INPUT_VALUE } from './nodes/Log';
import {
  Loop,
  INPUT_ARRAY,
  INPUT_FIRST,
  INPUT_LAST,
  INPUT_STEP,
  OUTPUT_ON_EXIT,
  OUTPUT_ON_BODY,
  OUTPUT_BODY,
  OUTPUT_INDEX,
} from './nodes/Loop';
import { If, INPUT_CONDITION, OUTPUT_TRUE } from './nodes/If';
import { Array as _Array, OUTPUT_LENGTH } from './nodes/Array';
import { OPTION_A, OPTION_B, Compare } from './nodes/Compare';
import { Start } from './nodes/Start';
// import HintOverlay from './components/HintOverlay.vue';
// import { Dev, Package, SetupTask } from "@cyn/plugin-electron";
export default defineComponent({
  components: { },
  data() {
    return {
      editor: new Editor() as Editor,
      viewPlugin: new ViewPlugin() as ViewPlugin,
      engine: new Engine(false) as Engine,
    };
  },
  async created() {
    this.editor.use(this.viewPlugin);

    this.editor.use(new OptionPlugin());

    this.editor.use(this.engine);

    this.viewPlugin.enableMinimap = true;

    // this.editor.registerNodeType("MathNode", MathNode);
    // this.editor.registerNodeType("DisplayNode", DisplayNode);
    this.editor.registerNodeType('Itch', itch);
    this.editor.registerNodeType('Electron > Dev', Dev);
    this.editor.registerNodeType('String', String);
    this.editor.registerNodeType('Path', Path);
    this.editor.registerNodeType('Log', Log);
    this.editor.registerNodeType('Loop', Loop);
    this.editor.registerNodeType('If', If);
    this.editor.registerNodeType('Array', _Array);
    this.editor.registerNodeType('Compare', Compare);
    this.editor.registerNodeType('Start', Start);
    // this.editor.registerNodeType("electron-package", Package);
    // this.editor.registerNodeType("electron-setup-task", SetupTask);

    // add some nodes so the screen is not empty on startup
    // const node1 = this.addNodeWithCoordinates(MathNode, 100, 140);
    // const node2 = this.addNodeWithCoordinates(DisplayNode, 400, 140);
    const itchNode = this.addNodeWithCoordinates(itch, 900, 550);
    const electronDevNode = this.addNodeWithCoordinates(Dev, 300, 300);
    const folderInputNode = this.addNodeWithCoordinates(String, 10, 450);
    const projectNode = this.addNodeWithCoordinates(String, 10, 600);
    const APIKeyNode = this.addNodeWithCoordinates(String, 10, 750);
    const LogNode = this.addNodeWithCoordinates(Log, 1200, 700);
    const LogNodeDone = this.addNodeWithCoordinates(Log, 1000, 10);
    const LoopNode = this.addNodeWithCoordinates(Loop, 600, 10);
    const IfNode = this.addNodeWithCoordinates(If, 1200, 150);
    const ArrayNode = this.addNodeWithCoordinates(_Array, 10, 10);
    const CompareNode = this.addNodeWithCoordinates(Compare, 900, 250);
    const StartNode = this.addNodeWithCoordinates(Start, 10, 200);

    projectNode.setOptionValue(OPTION_VALUE, 'MyProject');
    folderInputNode.setOptionValue(OPTION_VALUE, '/home/armaldio/test');
    APIKeyNode.setOptionValue(OPTION_VALUE, '123456789');
    // LogNodeDone.set(INPUT_VALUE, 'Done');

    this.editor.addConnection(
      ArrayNode.getInterface(OUTPUT_VALUE),
      LoopNode.getInterface(INPUT_ARRAY),
    );

    this.editor.addConnection(
      StartNode.getInterface(OUTPUT_FLOW),
      electronDevNode.getInterface(INPUT_FLOW),
    );

    this.editor.addConnection(
      electronDevNode.getInterface(OUTPUT_FLOW),
      LoopNode.getInterface(INPUT_FLOW),
    );

    this.editor.addConnection(
      IfNode.getInterface(OUTPUT_TRUE),
      itchNode.getInterface(INPUT_FLOW),
    );

    this.editor.addConnection(
      LoopNode.getInterface(OUTPUT_BODY),
      CompareNode.getInterface(OPTION_A),
    );

    this.editor.addConnection(
      CompareNode.getInterface(OUTPUT_VALUE),
      IfNode.getInterface(INPUT_CONDITION),
    );

    this.editor.addConnection(
      LoopNode.getInterface(OUTPUT_ON_BODY),
      IfNode.getInterface(INPUT_FLOW),
    );

    this.editor.addConnection(
      LoopNode.getInterface(OUTPUT_ON_EXIT),
      LogNodeDone.getInterface(INPUT_FLOW),
    );

    this.editor.addConnection(
      ArrayNode.getInterface(OUTPUT_LENGTH),
      LoopNode.getInterface(INPUT_LAST),
    );

    this.editor.addConnection(
      folderInputNode.getInterface(OUTPUT_VALUE),
      electronDevNode.getInterface(ElectronInputFolder),
    );

    this.editor.addConnection(
      itchNode.getInterface(INPUT_FOLDER),
      electronDevNode.getInterface(ElectronOutputFolder),
    );

    this.editor.addConnection(
      projectNode.getInterface(OUTPUT_VALUE),
      itchNode.getInterface(PROJECT),
    );

    this.editor.addConnection(
      APIKeyNode.getInterface(OUTPUT_VALUE),
      itchNode.getInterface(API_KEY),
    );

    this.editor.addConnection(
      itchNode.getInterface(OUTPUT_FOLDER),
      LogNode.getInterface(INPUT_VALUE),
    );

    this.editor.addConnection(
      itchNode.getInterface(OUTPUT_FLOW),
      LogNode.getInterface(INPUT_FLOW),
    );

    this.editor.addConnection(
      LoopNode.getInterface(OUTPUT_BODY),
      itchNode.getInterface(CHANNEL),
    );
  },
  methods: {
    addNodeWithCoordinates(NodeType: any, x: number, y: number) {
      const n = new NodeType();
      this.editor.addNode(n);
      n.position.x = x;
      n.position.y = y;
      return n;
    },
    idsToNames(ids: string[]) {
      return ids.map((id) => this.editor.nodes.find((n) => n.id === id)?.name);
    },
    async calculate() {
      console.log('this.engine', this.engine);
      console.log('this.engine', (this.engine as any).editor.nodes[0]);

      const dag = {
        nodes: {} as Record<string, { to: string[], from: string[] }>,
      };

      this.editor.connections.forEach((connection) => {
        const { from } = connection;
        const { to } = connection;

        if (!dag.nodes[from.parent.id]) {
          dag.nodes[from.parent.id] = { to: [], from: [] };
        }
        if (!dag.nodes[to.parent.id]) {
          dag.nodes[to.parent.id] = { to: [], from: [] };
        }

        dag.nodes[from.parent.id].to.push(to.parent.id);
        dag.nodes[to.parent.id].from.push(from.parent.id);
      });

      console.log('dag', dag);

      const nodesWithNoInputs = Object
        .entries(dag.nodes)
        .filter(([nodeId, node]) => dag.nodes[nodeId].from.length === 0)
        .map(([nodeId, node]) => nodeId);

      console.log('nodesWithNoInputs', this.idsToNames(nodesWithNoInputs));

      // Khan's algorithm
      const L = new Set<string>();
      const S = nodesWithNoInputs;

      // while S is non-empty
      while (S.length > 0) {
        // remove a node n from S
        const n = S.pop() as string;
        // add n to L
        L.add(n);
        // for each node m with an edge e from n to m do
        dag.nodes[n].to.forEach((m) => {
          // remove edge e from the graph
          dag.nodes[n].to = dag.nodes[n].to.filter((to) => to !== m);
          dag.nodes[m].from = dag.nodes[m].from.filter((from) => from !== n);
          // if m has no other incoming edges then
          if (dag.nodes[m].from.length === 0) {
            // insert m into S
            S.push(m);
          }
        });
      }

      // if graph has edges then
      if (Object.values(dag.nodes).some((node) => node.to.length > 0)) {
        throw new Error('Graph has cycles');
        // return error (graph has at least one cycle)
      } else {
        // return L (a topologically sorted order)
        console.log('L', this.idsToNames(Array.from(L)));
      }
    },
  },
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

.calculate-wrapper {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 10px;
}
.calculate-button {}
</style>
