import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { FaTrophy, FaMedal, FaStar, FaUser, FaCrown, FaChevronUp } from 'react-icons/fa';
import apiClient, { API_ENDPOINTS } from '../../config/api';
import Footer from '../../components/Footer/Footer';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRank, setCurrentUserRank] = useState(null);

    useEffect(() => {
        const fetchLeaders = async () => {
            try {
                const res = await apiClient.get(API_ENDPOINTS.LEADERBOARD);
                setLeaders(res.data.results || []);
                setCurrentUserRank(res.data.current_user_rank);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaders();
    }, []);

    const getMedalIcon = (index) => {
        if (index === 0) return <FaCrown className="medal-icon gold" />;
        if (index === 1) return <FaMedal className="medal-icon silver" />;
        if (index === 2) return <FaMedal className="medal-icon bronze" />;
        return <span className="rank-number">{index + 1}</span>;
    };

    const getMedalClass = (index) => {
        if (index === 0) return 'gold';
        if (index === 1) return 'silver';
        if (index === 2) return 'bronze';
        return '';
    };

    // TOP 3 podium (2nd, 1st, 3rd)
    const getPodiumOrder = () => {
        if (leaders.length === 0) return [];
        if (leaders.length === 1) return [leaders[0]];
        if (leaders.length === 2) return [leaders[1], leaders[0]];
        return [leaders[1], leaders[0], leaders[2]];
    };

    const getOtherLeaders = () => {
        if (leaders.length <= 3) return [];
        return leaders.slice(3);
    };

    return (
        <div className="leaderboard-page">
            <Helmet>
                <title>Reyting Jadvali — EduShare School | TOP 5 O'quvchilar</title>
                <meta name="description" content="EduShare School reyting jadvali — eng ko'p ball to'plagan TOP 5 o'quvchilar. O'rganish, test topshirish va sertifikat olish orqali reytingda yuqoriga chiqing!" />
                <meta name="keywords" content="EduShare reyting, eng yaxshi o'quvchilar, ball tizimi, ta'lim reytingi, TOP 5" />
                <link rel="canonical" href="https://edushare.uz/leaderboard" />
            </Helmet>

            {/* Section 1: Hero */}
            <section className="leaderboard-hero-section">
                <div className="hero-glow"></div>
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 60 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    <FaTrophy className="hero-trophy" />
                    <h1>TOP 5<br /><span>O'QUVCHILAR</span></h1>
                    <p>Eng ko'p ball to'plagan o'quvchilar reytingi</p>
                </motion.div>
            </section>

            {/* Section 2: Podium (1st, 2nd, 3rd) */}
            <section className="leaderboard-podium-section">
                {loading ? (
                    <div className="loading-state"><h3>YUKLANMOQDA...</h3></div>
                ) : (
                    <div className="podium-container">
                        <h2 className="section-title">🏆 REYTING JADVALI</h2>

                        {currentUserRank && (
                            <div className="current-user-rank-banner">
                                Sizning o'rningiz: <strong>#{currentUserRank}</strong>
                            </div>
                        )}

                        <div className="podium-grid">
                            {getPodiumOrder().map((leader, podiumIdx) => {
                                // actualIndex logic: if 3 leaders, order is 2,1,3. So idx 0 is rank 2, idx 1 is rank 1, idx 2 is rank 3.
                                let actualRankIndex = 0;
                                if (getPodiumOrder().length === 3) {
                                    actualRankIndex = podiumIdx === 0 ? 1 : podiumIdx === 1 ? 0 : 2;
                                } else if (getPodiumOrder().length === 2) {
                                    actualRankIndex = podiumIdx === 0 ? 1 : 0;
                                } else {
                                    actualRankIndex = 0;
                                }

                                return (
                                    <motion.div
                                        key={leader.id}
                                        className={`podium-card ${getMedalClass(actualRankIndex)} ${actualRankIndex === 0 ? 'champion' : ''}`}
                                        initial={{ opacity: 0, y: 80 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: podiumIdx * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                        viewport={{ once: true }}
                                        whileHover={{ y: -10, transition: { duration: 0.3 } }}
                                    >
                                        <div className="podium-rank-badge">
                                            {getMedalIcon(actualRankIndex)}
                                        </div>

                                        <div className={`podium-avatar-wrap ${getMedalClass(actualRankIndex)}`}>
                                            {leader.avatar ? (
                                                <img src={leader.avatar} alt={leader.full_name} className="podium-avatar" />
                                            ) : (
                                                <div className="podium-avatar-fallback">
                                                    <FaUser />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="podium-name">{leader.full_name || leader.username}</h3>
                                        {leader.school && <p className="podium-school">{leader.school}</p>}

                                        <div className="podium-points">
                                            <FaStar className="star-icon" />
                                            <span>{leader.points}</span>
                                            <small>ball</small>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Other ranks list */}
                        {getOtherLeaders().length > 0 && (
                            <div className="runners-up full-list">
                                {getOtherLeaders().map((leader, idx) => (
                                    <motion.div
                                        key={leader.id}
                                        className="runner-card"
                                        initial={{ opacity: 0, x: -40 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: (idx % 10) * 0.05, duration: 0.5 }}
                                        viewport={{ once: true }}
                                    >
                                        <span className="runner-rank">{idx + 4}</span>
                                        <div className="runner-avatar-wrap">
                                            {leader.avatar ? (
                                                <img src={leader.avatar} alt={leader.full_name} className="runner-avatar" />
                                            ) : (
                                                <div className="runner-avatar-fallback">
                                                    <FaUser />
                                                </div>
                                            )}
                                        </div>
                                        <div className="runner-info">
                                            <span className="runner-name">{leader.full_name || leader.username}</span>
                                            {leader.school && <span className="runner-school">{leader.school}</span>}
                                        </div>
                                        <div className="runner-stats">
                                            <span className="runner-points">
                                                <FaStar /> {leader.points} ball
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Footer */}
            <section className="horizontal-section" style={{ height: 'auto', minHeight: 'auto', display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                <Footer />
            </section>
        </div>
    );
};

export default LeaderboardPage;
