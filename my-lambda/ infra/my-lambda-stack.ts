import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { IVpc } from 'aws-cdk-lib/aws-ec2';
import { TheBridgeConstruct } from '../constructs/the-bridge-construct';
import { EventBus } from 'aws-cdk-lib/aws-events';

namespace PropertyBridgeStack {
  export interface Props extends StackProps {
    vpc: IVpc;
    isProd: boolean;
    eventBus: EventBus;
  }
}

export class PropertyBridgeStack extends Stack {
  constructor(scope: Construct, id: string, props: PropertyBridgeStack.Props) {
    super(scope, id, props);

    const { vpc, isProd, eventBus } = props;

    const suffix = isProd ? 'prod' : 'test';


    // 1. Create the Bridge
    const theBridge = new TheBridgeConstruct(
      this,
      `${id}-the-bridge-${suffix}`,
      { isProd }
    );

  }
}
