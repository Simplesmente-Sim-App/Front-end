import { getPublicGiftList, giftErrorMessage } from '$lib/gifts/api';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		return {
			giftList: await getPublicGiftList(params.slug, fetch),
			initialError: null,
			slug: params.slug
		};
	} catch (error) {
		return {
			giftList: null,
			initialError: giftErrorMessage(error),
			slug: params.slug
		};
	}
};
