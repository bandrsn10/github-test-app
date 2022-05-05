import fetch from 'node-fetch';

const GITHUB_API_URL = 'https://api.github.com/'
async function getRepositories(): Promise<any> {
    try {
        // 👇️ const response: Response
        const response = await fetch(GITHUB_API_URL + 'users/defunkt', {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error! status: ${response.status}`);
        }

        // 👇️ const result: GetUsersResponse
        const result = (await response.json());

        console.log('result is: ', JSON.stringify(result, null, 4));

        return result;
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

getRepositories();

console.log('hey there!');
console.log(process.env.GITHUB_TOKEN);
//set constant variable for Ramda org

//call the API
