import { useEffect, useState } from 'react';
import { api } from '../api/client';
import ContentBlocks from '../components/ContentBlocks';
import '../styles/contentPage.css';

export default function Faq() {
  const [content, setContent] = useState('');

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => setContent(res.data.settings.faq_content || ''))
      .catch(() => {});
  }, []);

  return (
    <div className="container section-block privacy-page">
      <h1 className="page-title">Perguntas Frequentes</h1>
      <div className="panel content-page">
        <ContentBlocks text={content} />
      </div>
    </div>
  );
}
