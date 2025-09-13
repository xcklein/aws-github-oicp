import { App, Stack, StackProps } from 'aws-cdk-lib';
import { GithubOicp } from './github-oicp';

export interface GithubStackProps extends StackProps {
  user: string;
  repo: string;
}

export class GithubStack extends Stack {
  constructor(scope: App, id: string, props: GithubStackProps) {
    super(scope, id, props);

    new GithubOicp(this, 'GithubOicp', {
      user: props.user,
      repo: props.repo,
    });
  }
}
