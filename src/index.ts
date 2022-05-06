import axios from 'axios';
import * as _ from 'lodash';
import * as linkHeader from 'http-link-header';

const GITHUB_API_URL = 'https://api.github.com/'


interface Repository {
    id: number;
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
        let pr = await getPullRequestsById(repo.id);

        //console.log(pr.length);
    }

    //console.log(repositories[0]);
    //console.log('hey there!');
    //console.log(process.env.GITHUB_TOKEN);
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

async function getPullRequestsById(id: number): Promise<PullRequest[]> {
    try {
        const response = await axios.get(GITHUB_API_URL + 'repositories/'+ id + '/pulls?state=all');
        
        if (response.headers.link) {
            const link = linkHeader.parse(response.headers.link);
            if (link.rel('next')) {
                console.log(link.rel('next')[0].uri);
            }
        }

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