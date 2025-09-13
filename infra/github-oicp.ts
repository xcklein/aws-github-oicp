import { aws_iam as IAM, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface GithubOicpProps {
  /**
   * The github repo owner username.
   */
  user: string;
  /**
   * The github repo slug.
   */
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
      roleName: 'github-oicp-role',
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
    this.role.addToPolicy(
      new IAM.PolicyStatement({
        effect: IAM.Effect.ALLOW,
        actions: ['cloudformation:*'],
        resources: ['*'],
      }),
    );
    this.role.addToPolicy(
      new IAM.PolicyStatement({
        effect: IAM.Effect.ALLOW,
        actions: ['s3:*'],
        resources: ['arn:aws:s3:::cdktoolkit-stagingbucket-*/*'],
      }),
    );
    this.role.addToPolicy(
      new IAM.PolicyStatement({
        effect: IAM.Effect.ALLOW,
        actions: ['sts:AssumeRole'],
        resources: ['arn:aws:iam::*:role/cdk*'],
      }),
    );
  }
}
