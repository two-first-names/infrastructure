import * as cdk from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

export class DnsStack extends cdk.Stack {
  public readonly zone: route53.IHostedZone;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    this.zone = new route53.PublicHostedZone(this, 'twofirstnames.org', {
      zoneName: 'twofirstnames.org'
    });

    new route53.MxRecord(this, 'twofirstnames.org-MX', {
      zone: this.zone,
      values: [
        {
          hostName: 'ASPMX.L.GOOGLE.COM.',
          priority: 1
        },
        {
          hostName: 'ALT1.ASPMX.L.GOOGLE.COM.',
          priority: 5
        },
        {
          hostName: 'ALT2.ASPMX.L.GOOGLE.COM.',
          priority: 5
        },
        {
          hostName: 'ALT3.ASPMX.L.GOOGLE.COM.',
          priority: 10
        },
        {
          hostName: 'ALT4.ASPMX.L.GOOGLE.COM.',
          priority: 10
        }
      ]
    });

    new route53.TxtRecord(this, 'twofirstnames.org-TXT', {
      zone: this.zone,
      values: ['v=spf1 include:_spf.google.com ~all']
    });

    new route53.ARecord(this, 'twofirstnames.org-A', {
      zone: this.zone,
      target: route53.RecordTarget.fromIpAddresses(
        '185.199.108.153',
        '185.199.109.153',
        '185.199.110.153',
        '185.199.111.153'
      )
    });

    new route53.AaaaRecord(this, 'twofirstnames.org-AAAA', {
      zone: this.zone,
      target: route53.RecordTarget.fromIpAddresses(
        '2606:50c0:8000::153',
        '2606:50c0:8001::153',
        '2606:50c0:8002::153',
        '2606:50c0:8003::153'
      )
    });
  }
}
