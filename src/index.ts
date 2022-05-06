import axios from 'axios';
import * as _ from 'lodash';

const GITHUB_API_URL = 'https://api.github.com/'


interface Repository {
    full_name: string;
    name: string;
}

interface PullRequest {
    id: string;
    number: string;
}

async function main(): Promise<void> {  
    const ORG = 'RAMDA'
    const repositories = await getRepositories(ORG);
    //now that we have the repositories, need to loop through each one to get pull requests
    for (var repo of repositories) {
        let pr = await getPullRequestsforOrg(ORG, repo.name);

        console.log(pr.length);
    }

    console.log(repositories[0]);
    console.log('hey there!');
    console.log(process.env.GITHUB_TOKEN);
}

async function getRepositories(org: string): Promise<Repository[]> {
    try {
       
        const response = await axios.get(GITHUB_API_URL + 'orgs/'+ org + '/repos');
        return response.data;
             
    } catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            throw error.message;
        } else {
            console.log('unexpected error: ', error);
            throw 'An unexpected error occurred';
        }
    }
}

async function getPullRequestsforOrg(org: string, repoName: string): Promise<PullRequest[]> {
    try {
        const response = await axios.get(GITHUB_API_URL + 'repos/'+ org + '/' + repoName + '/pulls?state=all');
        return response.data;
             
    } catch (error) {
        if (error instanceof Error) {
            console.log('error message: ', error.message);
            throw error.message;
        } else {
            console.log('unexpected error: ', error);
            throw 'An unexpected error occurred';
        }
    }

}

main();
///repos/ramda/eslint-plugin-ramda/pulls?state=all