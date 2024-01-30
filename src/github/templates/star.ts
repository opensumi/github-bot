import { ExtractPayload } from '../types';

import { StopHandleError } from './utils';

export async function handleStar(payload: ExtractPayload<'star'>) {
  const repository = payload.repository;
  const starCount = repository.stargazers_count;
  if (starCount % 100 === 0) {
    return {
      title: '⭐⭐⭐',
      text: `一个好消息，[${repository.full_name}](${repository.html_url}) 有 ${starCount} 颗 🌟 了~`,
    };
  }

  throw new StopHandleError('no need to send');
}
