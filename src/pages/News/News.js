import React, { useContext, useEffect, useState } from "react";
import "./News.css";
import "boxicons/css/boxicons.min.css";
import TokenContext from "../../context/TokenContext";
import axios from "../../services/axiosClient";

const CATEGORIES = ["All", "Market", "Economy", "Stocks"];

export const News = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const Token = useContext(TokenContext);

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    const get_news = async () => {
      await axios
        .get(`/news/`)
        .then((response) => {
          console.log(response.data);
          setData(response.data || []);
        })
        .catch((error) => {
          console.error(error);
          setData([]);
        });
    };

    get_news();
  }, [Token.token]);

  const filteredNews = data.filter((item) => {
    const matchesSearch =
      item.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const heroArticle = filteredNews[0];
  const gridArticles = filteredNews.slice(1);

  return (
    <div className="news-page-wrapper">
      <div className="news-page-container">
        {/* Header & Controls */}
        <div className="news-page-header">
          <div>
            <h1 className="news-page-title">
              <i className="bx bx-news"></i> Financial Market News
            </h1>
            <p className="news-page-subtitle">
              Real-time market insights, economic updates, and breaking announcements.
            </p>
          </div>

          <div className="news-search-bar">
            <i className="bx bx-search search-icon"></i>
            <input
              type="text"
              placeholder="Search news & announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                <i className="bx bx-x"></i>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="news-category-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Content */}
        {filteredNews.length === 0 ? (
          <div className="news-empty-state">
            <i className="bx bx-news-alt empty-icon"></i>
            <h3>No Market News Found</h3>
            <p>Try refining your search terms or selecting a different category filter.</p>
          </div>
        ) : (
          <div className="news-content-layout">
            {/* Featured Hero Article */}
            {heroArticle && (
              <div
                className="news-hero-card"
                onClick={() => setSelectedArticle(heroArticle)}
              >
                <div className="hero-badge-strip">
                  <span className="news-badge hero">Breaking News</span>
                  <span className="news-date-tag">
                    <i className="bx bx-time-five"></i> {formatDate(heroArticle.news_time)}
                  </span>
                </div>
                <h2 className="news-hero-title">{heroArticle.topic}</h2>
                <p className="news-hero-excerpt">
                  {heroArticle.content?.length > 180
                    ? heroArticle.content.substring(0, 180) + "..."
                    : heroArticle.content}
                </p>
                <div className="news-hero-footer">
                  <span className="read-more-link">
                    Read Full Story <i className="bx bx-right-arrow-alt"></i>
                  </span>
                </div>
              </div>
            )}

            {/* Grid of News Cards */}
            {gridArticles.length > 0 && (
              <div className="news-cards-grid">
                {gridArticles.map((article) => (
                  <div
                    key={article.id || article.topic}
                    className="news-card"
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="news-card-header">
                      <span className="news-badge">Market</span>
                      <span className="news-date-tag">{formatDate(article.news_time)}</span>
                    </div>
                    <h3 className="news-card-title">{article.topic}</h3>
                    <p className="news-card-content">
                      {article.content?.length > 120
                        ? article.content.substring(0, 120) + "..."
                        : article.content}
                    </p>
                    <div className="news-card-footer">
                      <span className="card-read-action">
                        Read Story <i className="bx bx-chevron-right"></i>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="news-modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="news-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="news-modal-header">
              <div className="modal-badge-group">
                <span className="news-badge">Financial News</span>
                <span className="news-date-tag">{formatDate(selectedArticle.news_time)}</span>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedArticle(null)}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <h2 className="news-modal-title">{selectedArticle.topic}</h2>
            <div className="news-modal-body">
              <p>{selectedArticle.content}</p>
            </div>
            <div className="news-modal-footer">
              <button className="modal-done-btn" onClick={() => setSelectedArticle(null)}>
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default News;



