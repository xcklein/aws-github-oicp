import { App, Environment } from 'aws-cdk-lib';
import { GithubStack } from './github-stack';

const app = new App();

const account = app.node.getContext('account');
const region = app.node.getContext('region');
const user = app.node.getContext('user');
const repo = app.node.getContext('repo');

const env = { account, region } as Environment;

new GithubStack(app, 'GithubStack', { env, user, repo });

app.synth();
