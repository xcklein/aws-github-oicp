import { aws_iam as IAM, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface GithubOicpProps {
  user: string;
  repo: string;
}

export class GithubOicp extends Construct {
  readonly oicp: IAM.OpenIdConnectProvider;
  readonly role: IAM.Role;

  constructor(scope: Construct, id: string, props: GithubOicpProps) {
    super(scope, id);

    this.oicp = new IAM.OpenIdConnectProvider(this, 'Oicp', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    this.role = new IAM.Role(this, 'Role', {
      assumedBy: new IAM.WebIdentityPrincipal(this.oicp.openIdConnectProviderArn, {
        StringLike: {
          'token.actions.githubusercontent.com:sub': `repo:${props.user}/${props.repo}:*`,
        },
      }),
    });

    this.role.addToPolicy(
      new IAM.PolicyStatement({
        effect: IAM.Effect.ALLOW,
        actions: ['ssm:GetParameter'],
        resources: [`arn:aws:ssm:*:${Stack.of(this).account}:parameter/cdk-bootstrap/*`],
      }),
    );
  }
}
