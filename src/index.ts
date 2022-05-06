import axios from 'axios';
import { parse } from 'http-link-header';

const GITHUB_API_URL = 'https://api.github.com/'

interface Repository {
    id: number;
    full_name: string;
    name: string;
    amountOfPullRequests: number;
}

interface PullRequest {
    id: string;
    number: string;
}

async function main(): Promise<void> {
    const ORG = 'RAMDA'
    const repositories = await getRepositories(ORG);

    //now that we have the repositories, need to loop through each one to get pull requests
    let totalAmountOfPullRequests = 0;
    let repoIndex = 1;
    for (var repo of repositories) {
        console.log('Getting Pull Requests for repository ' + repoIndex + ' of ' + repositories.length);
        let pr = await getPullRequestsById(repo.id);

        repo.amountOfPullRequests = pr.length;
        console.log(repo.full_name + ' has ' + repo.amountOfPullRequests + ' pull requests');
        totalAmountOfPullRequests += repo.amountOfPullRequests;
        repoIndex++;
    }
    console.log(ORG + ' has ' + totalAmountOfPullRequests + ' total pull requests');
}

async function getRepositories(org: string): Promise<Repository[]> {
    try {

        const response = await axios.get(GITHUB_API_URL + 'orgs/' + org + '/repos', {
            //added bearer token to avoid 403 error
            headers: {
                Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
            }
        });

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

async function getPullRequestsById(id: number, page?: number): Promise<PullRequest[]> {
    try {
        const apiUri = page ?
            GITHUB_API_URL + 'repositories/' + id + '/pulls?state=all&page=' + page :
            GITHUB_API_URL + 'repositories/' + id + '/pulls?state=all';

        //again add bearer token to avoid 403 error
        const response = await axios.get(apiUri, {
            headers: {
                Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
            }
        });

        //check for link key value pair (next and last) to know total amount of pages to call recursively
        if (response.headers.link) {
            const link = parse(response.headers.link);
            if (link.rel('next') && (link.rel('next').length)) {

                //get next page for recursive call
                const nextUri: URL = new URL(link.rel('next')[0].uri);
                const nextSearchParams = nextUri.searchParams;
                const nextPageNumber = Number(nextSearchParams.get('page'));

                //get last page for displaying progress to user
                const lastUri: URL = new URL(link.rel('last')[0].uri);
                const lastSearchParams = lastUri.searchParams;
                const lastPageNumber = Number(lastSearchParams.get('page'));

                console.log('Getting Pull Requests for page ' + nextPageNumber + ' of ' + lastPageNumber);

                const prNextPage = await getPullRequestsById(id, nextPageNumber);

                //accumulating pull Requests by pushing into the previous amount's data
                response.data.push(...prNextPage);
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