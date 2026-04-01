const HEALTH_RSS_URL = 'https://vnexpress.net/rss/suc-khoe.rss';
const PROXIED_RSS_URL = `https://api.allorigins.win/raw?url=${encodeURIComponent(HEALTH_RSS_URL)}`;

const FALLBACK_ARTICLES = [
  {
    id: 'fallback-1',
    title: 'Khám sức khỏe định kỳ giúp phát hiện bệnh sớm',
    category: 'Sức khỏe tổng quát',
    author: 'MediCore',
    date: 'N/A',
    excerpt: 'Khám định kỳ giúp theo dõi các chỉ số quan trọng và phát hiện sớm nguy cơ bệnh lý.',
    url: '/patient/articles',
    image: '',
  },
  {
    id: 'fallback-2',
    title: 'Thực đơn lành mạnh cho gia đình bận rộn',
    category: 'Dinh dưỡng',
    author: 'MediCore',
    date: 'N/A',
    excerpt: 'Duy trì bữa ăn cân bằng dinh dưỡng giúp tăng sức đề kháng và cải thiện sức khỏe lâu dài.',
    url: '/patient/articles',
    image: '',
  },
  {
    id: 'fallback-3',
    title: '5 thói quen tốt cho người tăng huyết áp',
    category: 'Tim mạch',
    author: 'MediCore',
    date: 'N/A',
    excerpt: 'Theo dõi huyết áp, vận động đều đặn và ngủ đủ giấc là các bước chăm sóc nền tảng.',
    url: '/patient/articles',
    image: '',
  },
];

const stripHtml = (html = '') =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getImageFromDescription = (description = '') => {
  const imageMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
  return imageMatch?.[1] || '';
};

const formatDate = (rawDate = '') => {
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return 'N/A';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
};

const parseRssXml = (xmlText, limit) => {
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (xml.querySelector('parsererror')) {
    throw new Error('Unable to parse RSS feed');
  }

  const items = Array.from(xml.querySelectorAll('item')).slice(0, limit);

  return items.map((item, index) => {
    const title = item.querySelector('title')?.textContent?.trim() || 'Bài viết y tế';
    const category = item.querySelector('category')?.textContent?.trim() || 'Sức khỏe';
    const author = item.querySelector('author')?.textContent?.trim() || 'VNExpress';
    const rawDate = item.querySelector('pubDate')?.textContent?.trim() || '';
    const descriptionRaw = item.querySelector('description')?.textContent || '';
    const excerpt = stripHtml(descriptionRaw).slice(0, 180);
    const url = item.querySelector('link')?.textContent?.trim() || '#';
    const mediaContent = item.getElementsByTagName('media:content')?.[0];
    const image = mediaContent?.getAttribute('url') || getImageFromDescription(descriptionRaw);

    return {
      id: `${title}-${index}`,
      title,
      category,
      author,
      date: formatDate(rawDate),
      excerpt: excerpt || 'Bài viết y tế mới được cập nhật.',
      url,
      image,
    };
  });
};

export const getHealthArticles = async (limit = 6) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(PROXIED_RSS_URL, {
      method: 'GET',
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const rssXml = await response.text();
    const parsedArticles = parseRssXml(rssXml, limit);
    return parsedArticles.length ? parsedArticles : FALLBACK_ARTICLES.slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch health articles:', error);
    return FALLBACK_ARTICLES.slice(0, limit);
  } finally {
    clearTimeout(timeoutId);
  }
};
