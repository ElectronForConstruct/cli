<template>
  <div style="height: 100vh; width: 100vw">
    <baklava-editor :plugin="viewPlugin" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HintOverlay from "./components/HintOverlay.vue";
import { Editor } from "@baklavajs/core";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue3";
import { OptionPlugin } from "@baklavajs/plugin-options-vue3";
import { Engine } from "@baklavajs/plugin-engine";
import { MathNode } from "./nodes/MathNode";
import { DisplayNode } from "./nodes/DisplayNode";
import { itch } from "@cyn/plugin-itch";
import { Dev, Package, SetupTask } from "@cyn/plugin-electron";

console.log('DisplayNode', DisplayNode)
console.log('Itch', itch)

export default defineComponent({
  components: { HintOverlay },
  data() {
    return {
      editor: new Editor() as Editor,
      viewPlugin: new ViewPlugin() as ViewPlugin,
      engine: new Engine(false) as Engine,
    };
  },
  created() {
    this.editor.use(this.viewPlugin);

    this.editor.use(new OptionPlugin());

    this.editor.use(this.engine);

    this.viewPlugin.enableMinimap = true;

    // this.editor.registerNodeType("MathNode", MathNode);
    // this.editor.registerNodeType("DisplayNode", DisplayNode);
    this.editor.registerNodeType("itch", itch);
    this.editor.registerNodeType("electron-dev", Dev);
    this.editor.registerNodeType("electron-package", Package);
    this.editor.registerNodeType("electron-setup-task", SetupTask);

    // add some nodes so the screen is not empty on startup
    // const node1 = this.addNodeWithCoordinates(MathNode, 100, 140);
    // const node2 = this.addNodeWithCoordinates(DisplayNode, 400, 140);
    const node3 = this.addNodeWithCoordinates(itch, 700, 140);

    // this.editor.addConnection(
    //   node1.getInterface("Result"),
    //   node2.getInterface("Value")
    // );
  },
  methods: {
    addNodeWithCoordinates(nodeType, x, y) {
      const n = new nodeType();
      this.editor.addNode(n);
      n.position.x = x;
      n.position.y = y;
      return n;
    },
  },
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>