import provider from './provider';

export default async function getAccounts() {
    return await provider.listAccounts();
}