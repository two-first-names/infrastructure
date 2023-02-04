import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface InstancesStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class InstancesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InstancesStackProps) {
    super(scope, id, props);

    const sshdRestartHandle = new ec2.InitServiceRestartHandle();
    const sshConfig = new ec2.InitConfig([
      ec2.InitFile.fromString(
        '/etc/ssh/ca.pub',
        'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAILMZvLjg6hCNbMgxmhxlsssBxne+ljsv4T+Gdg0wLR4U',
        {
          serviceRestartHandles: [sshdRestartHandle]
        }
      ),
      ec2.InitFile.fromString(
        '/etc/ssh/sshd_config/ca.conf',
        'AuthorizedPrincipalsFile %h/.ssh/authorized_principals\n' +
          'TrustedUserCAKeys /etc/ssh/ca.pub',
        {
          serviceRestartHandles: [sshdRestartHandle]
        }
      ),
      ec2.InitFile.fromString(
        '/home/ec2-user/.ssh/authorized_principals',
        'admin'
      ),
      ec2.InitService.enable('sshd', {
        enabled: true,
        ensureRunning: true,
        serviceRestartHandle: sshdRestartHandle
      })
    ]);

    const unboundInstance = new ec2.Instance(this, 'unbound', {
      machineImage: ec2.MachineImage.fromSsmParameter(
        '/aws/service/ami-amazon-linux-latest/al2022-ami-kernel-default-arm64',
        {
          cachedInContext: true
        }
      ),
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(50, {
            volumeType: ec2.EbsDeviceVolumeType.GP3
          })
        }
      ],
      init: ec2.CloudFormationInit.fromConfigSets({
        configSets: {
          default: ['sshConfig']
        },
        configs: {
          sshConfig
        }
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.NANO
      ),
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      keyName: 'joe-ed25519'
    });

    unboundInstance.connections.allowFromAnyIpv4(ec2.Port.tcp(22));
    unboundInstance.connections.allowFromAnyIpv4(ec2.Port.tcp(53));
    unboundInstance.connections.allowFromAnyIpv4(ec2.Port.udp(53));
  }
}
