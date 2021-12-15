/* eslint-disable no-underscore-dangle */
import { BaklavaEvent, PreventableBaklavaEvent, SequentialHook } from '@baklavajs/events';
import {
  IEditor, INode, IPlugin, INodeInterface, IConnection,
} from '@baklavajs/core/dist/baklavajs-core/types';
import { IInterfaceTypePlugin } from '@baklavajs/plugin-engine';
import { calculateOrder, containsCycle } from './nodeTreeBuilder';

// eslint-disable-next-line import/prefer-default-export
export class Engine implements IPlugin {
    public type = 'EnginePlugin';

    public get rootNodes() {
      return this._rootNodes;
    }

    public set rootNodes(value: INode[] | undefined) {
      this._rootNodes = value;
      this.recalculateOrder = true;
    }

    public events = {
      /** This event will be called before all the nodes `calculate` functions are called.
         * The argument is the calculationData that the nodes will receive
         */
      beforeCalculate: new PreventableBaklavaEvent<any>(),
      calculated: new BaklavaEvent<Map<INode, any>>(),
    };

    public hooks = {
      gatherCalculationData: new SequentialHook<any>(),
    };

    private editor!: IEditor;

    private nodeCalculationOrder: INode[] = [];

    private actualRootNodes: INode[] = [];

    private connectionsPerNode = new Map<INode, IConnection[]>();

    private recalculateOrder = false;

    private calculateOnChange = false;

    private calculationInProgress = false;

    private mutex = new Mutex();

    private _rootNodes: INode[] | undefined = undefined;

    private interfaceTypePlugins: IInterfaceTypePlugin[] = [];

    /**
     * Construct a new Engine plugin
     * @param calculateOnChange Whether to automatically calculate all nodes when any node interface or node option is changed.
     */
    public constructor(calculateOnChange = false) {
      this.calculateOnChange = calculateOnChange;
    }

    public register(editor: IEditor) {
      this.editor = editor;

      // Search for previously registered interface type plugins
      this.editor.plugins.forEach((p) => {
        if (p.type === 'InterfaceTypePlugin') {
          this.interfaceTypePlugins.push(p as IInterfaceTypePlugin);
        }
      });
      // Watch for newly registered interface type plugins
      this.editor.events.usePlugin.addListener(this, (p) => {
        if (p.type === 'InterfaceTypePlugin') {
          this.interfaceTypePlugins.push(p as IInterfaceTypePlugin);
        }
      });

      this.editor.events.addNode.addListener(this, (node) => {
        node.events.update.addListener(this, (ev) => {
          if (ev.interface && ev.interface.connectionCount === 0) {
            this.onChange(false);
          } else if (ev.option) {
            this.onChange(false);
          }
        });
        this.onChange(true);
      });

      this.editor.events.removeNode.addListener(this, (node) => {
        node.events.update.removeListener(this);
      });

      this.editor.events.checkConnection.addListener(this, (c) => {
        if (!this.checkConnection(c.from, c.to)) {
          return false;
        }
      });

      this.editor.events.addConnection.addListener(this, (c) => {
        // as only one connection to an input interface is allowed
        // Delete all other connections to the target interface
        this.editor.connections
          .filter((conn) => conn.id !== c.id && conn.to === c.to)
          .forEach((conn) => this.editor.removeConnection(conn));

        this.onChange(true);
      });

      this.editor.events.removeConnection.addListener(this, () => {
        this.onChange(true);
      });
    }

    /**
     * Calculate all nodes.
     * This will automatically calculate the node calculation order if necessary and
     * transfer values between connected node interfaces.
     * @returns A promise that resolves to either
     * - a map that maps rootNodes to their calculated value (what the calculation function of the node returned)
     * - null if the calculation was prevented from the beforeCalculate event
     */
    public async calculate(calculationData?: any): Promise<Map<INode, any> | null> {
      return await this.mutex.runExclusive(async () => await this.internalCalculate(calculationData));
    }

    /**
     * Force the engine to recalculate the node execution order.
     * This is normally done automatically. Use this method if the
     * default change detection does not work in your scenario.
     */
    public calculateOrder() {
      this.calculateNodeTree();
      this.recalculateOrder = false;
    }

    private async internalCalculate(calculationData?: any): Promise<Map<INode, any> | null> {
      if (this.events.beforeCalculate.emit(calculationData)) {
        return null;
      }
      calculationData = this.hooks.gatherCalculationData.execute(calculationData);

      this.calculationInProgress = true;
      if (this.recalculateOrder) {
        this.calculateOrder();
      }
      const results: Map<INode, any> = new Map();
      for (const n of this.nodeCalculationOrder) {
        const r = await n.calculate(calculationData);
        if (this.actualRootNodes.includes(n)) {
          results.set(n, r);
        }
        if (this.connectionsPerNode.has(n)) {
                this.connectionsPerNode.get(n)!.forEach((c) => {
                  const conversion = this.interfaceTypePlugins.find((p) => p.canConvert((c.from as any).type, (c.to as any).type));
                  if (conversion) {
                    c.to.value = conversion.convert((c.from as any).type, (c.to as any).type, c.from.value);
                  } else {
                    c.to.value = c.from.value;
                  }
                });
        }
      }
      this.calculationInProgress = false;
      this.events.calculated.emit(results);
      return results;
    }

    private checkConnection(from: INodeInterface, to: INodeInterface) {
      const dc = {
        from, to, id: 'dc', destructed: false, isInDanger: false,
      } as IConnection;
      const copy = (this.editor.connections as ReadonlyArray<IConnection>).concat([dc]);
      copy.filter((conn) => conn.to !== to);
      return containsCycle(this.editor.nodes, copy);
    }

    private onChange(recalculateOrder: boolean) {
      this.recalculateOrder = this.recalculateOrder || recalculateOrder;
      if (this.calculateOnChange && !this.calculationInProgress) {
        this.calculate();
      }
    }

    private calculateNodeTree() {
      const { calculationOrder, rootNodes } = calculateOrder(
        this.editor.nodes,
        this.editor.connections,
        this.rootNodes,
      );
      this.nodeCalculationOrder = calculationOrder;
      this.actualRootNodes = rootNodes;
      this.connectionsPerNode.clear();
      this.editor.nodes.forEach((n) => {
        this.connectionsPerNode.set(
          n,
          this.editor.connections.filter((c) => c.from.parent === n),
        );
      });
    }
}
