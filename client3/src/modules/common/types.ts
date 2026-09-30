
  export interface GridRendererComponent {
    id: number;
    dataPath: string;
    validationRules?: Record<string, string>;
    component: any;
    extraProps?: Record<string, any>;
  }

