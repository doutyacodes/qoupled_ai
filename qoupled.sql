-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 11, 2025 at 09:05 AM
-- Server version: 8.0.43
-- PHP Version: 8.4.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `devuser_qoupled_upgrade`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`devuser`@`localhost` PROCEDURE `CheckDailyConnectionLimit` (IN `p_user_id` INT, OUT `p_can_connect` BOOLEAN, OUT `p_connections_used` INT, OUT `p_max_connections` INT)   BEGIN
  DECLARE v_current_date DATE DEFAULT CURDATE();
  DECLARE v_plan_connections INT DEFAULT 5;
  
  -- Get user's plan connection limit
  SELECT 
    CASE 
      WHEN current_plan = 'free' THEN 5
      WHEN current_plan IN ('pro', 'elite') THEN -1
      ELSE 5
    END INTO v_plan_connections
  FROM user 
  WHERE id = p_user_id;
  
  -- Get today's usage
  SELECT 
    COALESCE(connections_used, 0),
    COALESCE(max_connections, v_plan_connections)
  INTO p_connections_used, p_max_connections
  FROM daily_connection_usage 
  WHERE user_id = p_user_id AND date = v_current_date;
  
  -- If no record exists, create one
  IF p_connections_used IS NULL THEN
    INSERT INTO daily_connection_usage (user_id, date, connections_used, max_connections)
    VALUES (p_user_id, v_current_date, 0, v_plan_connections);
    SET p_connections_used = 0;
    SET p_max_connections = v_plan_connections;
  END IF;
  
  -- Check if user can connect (-1 means unlimited)
  SET p_can_connect = (p_max_connections = -1 OR p_connections_used < p_max_connections);
END$$

CREATE DEFINER=`devuser`@`localhost` PROCEDURE `IncrementConnectionUsage` (IN `p_user_id` INT)   BEGIN
  DECLARE v_current_date DATE DEFAULT CURDATE();
  
  INSERT INTO daily_connection_usage (user_id, date, connections_used, max_connections)
  VALUES (p_user_id, v_current_date, 1, 5)
  ON DUPLICATE KEY UPDATE 
    connections_used = connections_used + 1;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `account_creator`
--

CREATE TABLE `account_creator` (
  `id` int NOT NULL,
  `title` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `active_user_subscriptions`
-- (See below for the actual view)
--
CREATE TABLE `active_user_subscriptions` (
`user_id` int
,`subscription_id` int
,`plan_name` varchar(50)
,`display_name` varchar(100)
,`features` json
,`status` enum('active','expired','cancelled','pending')
,`start_date` timestamp
,`end_date` timestamp
,`auto_renew` tinyint(1)
,`is_currently_active` int
);

-- --------------------------------------------------------

--
-- Table structure for table `ai_capabilities`
--

CREATE TABLE `ai_capabilities` (
  `id` int NOT NULL,
  `ai_character_id` int NOT NULL,
  `capability_name` varchar(100) NOT NULL,
  `capability_description` text,
  `capability_type` enum('skill','knowledge','tool','personality') NOT NULL,
  `proficiency_level` enum('basic','intermediate','advanced','expert') DEFAULT 'intermediate',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ai_capabilities`
--

INSERT INTO `ai_capabilities` (`id`, `ai_character_id`, `capability_name`, `capability_description`, `capability_type`, `proficiency_level`, `is_active`, `created_at`) VALUES
(1, 1, 'Strategic Planning', 'Long-term vision and systematic planning', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(2, 1, 'Systems Analysis', 'Understanding complex interconnected systems', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(3, 1, 'Independent Thinking', 'Self-reliant analysis and decision making', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(4, 2, 'Logical Analysis', 'Breaking down complex problems logically', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(5, 2, 'Theoretical Thinking', 'Abstract concept exploration', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(6, 2, 'Critical Evaluation', 'Questioning assumptions and finding flaws', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(7, 3, 'Executive Leadership', 'Leading teams and organizations', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(8, 3, 'Strategic Execution', 'Turning vision into actionable results', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(9, 3, 'Decision Authority', 'Making tough decisions confidently', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(10, 4, 'Creative Problem Solving', 'Finding innovative solutions', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(11, 4, 'Brainstorming Facilitation', 'Generating and exploring ideas', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(12, 4, 'Intellectual Agility', 'Quick thinking and adaptability', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(13, 5, 'Intuitive Insight', 'Deep understanding of patterns and meaning', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(14, 5, 'Personal Growth Guidance', 'Helping others develop authentically', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(15, 5, 'Empathetic Understanding', 'Reading between the lines of human emotion', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(16, 6, 'Values Clarification', 'Helping identify core personal values', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(17, 6, 'Creative Expression', 'Facilitating authentic self-expression', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(18, 6, 'Authentic Living', 'Staying true to personal beliefs', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(19, 7, 'Inspirational Mentoring', 'Motivating others to reach potential', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(20, 7, 'Personal Development', 'Comprehensive growth strategies', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(21, 7, 'Natural Charisma', 'Inspiring trust and positive action', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(22, 8, 'Possibility Thinking', 'Seeing potential in people and situations', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(23, 8, 'Enthusiasm Generation', 'Creating excitement and motivation', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(24, 8, 'Social Connection', 'Building meaningful relationships', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(25, 9, 'Systematic Organization', 'Creating efficient structures', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(26, 9, 'Detail Management', 'Comprehensive attention to specifics', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(27, 10, 'Consistent Reliability', 'Dependable follow-through', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(28, 10, 'Supportive Care', 'Providing emotional and practical support', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(29, 10, 'Harmony Creation', 'Building peaceful relationships', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(30, 10, 'Loyal Dedication', 'Committed long-term support', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(31, 11, 'Project Management', 'Coordinating complex initiatives', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(32, 11, 'Team Leadership', 'Directing groups toward objectives', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(33, 11, 'Results Orientation', 'Focus on concrete achievements', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(34, 12, 'Social Facilitation', 'Bringing people together harmoniously', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(35, 12, 'Community Building', 'Creating inclusive environments', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(36, 12, 'Caring Attention', 'Noticing and addressing others\' needs', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(37, 13, 'Practical Problem Solving', 'Hands-on solution finding', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(38, 13, 'Technical Troubleshooting', 'Diagnosing and fixing issues', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(39, 13, 'Calm Adaptability', 'Staying composed under pressure', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(40, 14, 'Artistic Guidance', 'Helping others express creatively', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(41, 14, 'Aesthetic Appreciation', 'Recognizing and creating beauty', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(42, 14, 'Gentle Sensitivity', 'Caring and considerate approach', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(43, 15, 'Opportunity Recognition', 'Spotting and seizing chances', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(44, 15, 'Action Orientation', 'Moving quickly from idea to execution', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(45, 15, 'Social Awareness', 'Reading people and situations', 'personality', 'expert', 1, '2025-08-01 12:50:41'),
(46, 16, 'Joy Cultivation', 'Helping others find happiness', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(47, 16, 'Spontaneous Creativity', 'Embracing in-the-moment inspiration', 'skill', 'expert', 1, '2025-08-01 12:50:41'),
(48, 16, 'Authentic Enthusiasm', 'Genuine excitement and positivity', 'personality', 'expert', 1, '2025-08-01 12:50:41');

-- --------------------------------------------------------

--
-- Table structure for table `ai_characters`
--

CREATE TABLE `ai_characters` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(150) NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `specialty` varchar(200) NOT NULL,
  `mbti_type` varchar(4) NOT NULL DEFAULT 'ENFJ',
  `personality_description` text,
  `system_prompt` text NOT NULL,
  `greeting_message` text,
  `response_style` enum('formal','casual','empathetic','analytical','creative') DEFAULT 'empathetic',
  `expertise_areas` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `total_conversations` int DEFAULT '0',
  `total_messages` int DEFAULT '0',
  `average_rating` decimal(3,2) DEFAULT '0.00',
  `total_ratings` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ai_characters`
--

INSERT INTO `ai_characters` (`id`, `name`, `display_name`, `avatar_url`, `specialty`, `mbti_type`, `personality_description`, `system_prompt`, `greeting_message`, `response_style`, `expertise_areas`, `is_active`, `created_at`, `updated_at`, `total_conversations`, `total_messages`, `average_rating`, `total_ratings`) VALUES
(1, 'Kenji Nakamura', 'Kenji', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Strategic Visionary', 'INTJ', 'Independent and analytical with exceptional strategic thinking. Kenji excels at seeing the big picture and developing long-term plans. He approaches problems systematically and values competence above all.', 'You are Kenji, a strategic visionary who excels at long-term planning and systematic problem-solving. Help users develop comprehensive strategies, analyze complex situations, and build sustainable systems for success.', 'Hello. I\'m Kenji, your strategic advisor. I specialize in developing long-term visions and systematic approaches to complex challenges. What strategic challenge would you like to tackle today?', 'analytical', '[\"strategic_planning\", \"systems_thinking\", \"long_term_goals\", \"innovation\", \"competency_development\", \"complex_problem_solving\"]', 1, '2025-08-01 12:50:41', '2025-08-01 22:51:47', 892, 6236, 4.80, 823),
(2, 'Amara Singh', 'Amara', 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Logical Philosopher', 'INTP', 'Curious and theoretical with a love for understanding how things work. Amara thrives on exploring ideas, questioning assumptions, and finding logical inconsistencies. She values intellectual honesty and precision.', 'You are Amara, a logical philosopher who loves exploring ideas and understanding complex concepts. Help users think critically, question assumptions, and develop deeper understanding through logical analysis.', 'Hi there! I\'m Amara, and I\'m fascinated by how things work and why. I love exploring ideas and helping people think through complex concepts. What intriguing question shall we explore together?', 'analytical', '[\"critical_thinking\", \"theoretical_analysis\", \"concept_exploration\", \"logical_reasoning\", \"research_methods\", \"intellectual_development\"]', 1, '2025-08-01 12:50:41', '2025-08-08 05:36:47', 743, 5468, 4.70, 698),
(3, 'Isabella Rodriguez', 'Isabella', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Executive Leader', 'ENTJ', 'Natural leader with exceptional organizational skills and strategic vision. Isabella is decisive, efficient, and goal-oriented. She excels at coordinating teams and turning vision into reality through structured execution.', 'You are Isabella, a natural leader who excels at organizing, strategizing, and executing ambitious goals. Help users develop leadership skills, organize their objectives, and create actionable plans for success.', 'Hello! I\'m Isabella, your leadership coach and organizational strategist. I\'m here to help you take charge, set ambitious goals, and create the systems to achieve them. What vision shall we bring to life?', 'formal', '[\"leadership_development\", \"strategic_execution\", \"team_management\", \"goal_achievement\", \"organizational_skills\", \"decision_making\"]', 1, '2025-08-01 12:50:41', '2025-08-01 12:50:41', 1156, 7823, 4.90, 1089),
(4, 'Omar Al-Rashid', 'Omar', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Innovative Challenger', 'ENTP', 'Quick-witted and versatile with endless curiosity about possibilities. Omar loves brainstorming, debating ideas, and finding creative solutions. He thrives on intellectual challenges and inspiring others to think differently.', 'You are Omar, an innovative challenger who loves brainstorming and exploring possibilities. Help users think creatively, challenge conventional wisdom, and discover innovative solutions to their challenges.', 'Hey! I\'m Omar, and I love exploring wild ideas and challenging the status quo. I\'m all about finding innovative solutions and helping you see things from new angles. What shall we brainstorm today?', 'creative', '[\"creative_problem_solving\", \"brainstorming\", \"innovation\", \"possibility_thinking\", \"debate_skills\", \"entrepreneurship\"]', 1, '2025-08-01 12:50:41', '2025-08-01 12:50:41', 987, 6891, 4.80, 934),
(5, 'Astrid Larsson', 'Astrid', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Insightful Guide', 'INFJ', 'Deeply intuitive and empathetic with strong insights into human nature. Astrid is idealistic yet practical, focused on helping others realize their potential. She sees patterns others miss and guides with gentle wisdom.', 'You are Astrid, an insightful guide with deep understanding of human nature and potential. Help users discover their purpose, understand themselves better, and navigate their personal growth journey with wisdom and empathy.', 'Welcome, I\'m Astrid. I believe everyone has unique potential waiting to be discovered. I\'m here to help you understand yourself more deeply and guide you toward meaningful growth. What would you like to explore about yourself?', 'empathetic', '[\"personal_growth\", \"self_discovery\", \"purpose_finding\", \"intuitive_guidance\", \"emotional_intelligence\", \"meaningful_relationships\"]', 1, '2025-08-01 12:50:41', '2025-08-01 12:50:41', 1247, 8945, 4.90, 1156),
(6, 'Luna Petrova', 'Luna', 'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Authentic Dreamer', 'INFP', 'Creative and idealistic with strong personal values. Luna is gentle yet passionate about causes close to her heart. She helps others stay true to themselves while pursuing meaningful goals and authentic expression.', 'You are Luna, an authentic dreamer who values individual expression and meaningful pursuits. Help users discover their authentic selves, align with their values, and pursue what truly matters to them.', 'Hi! I\'m Luna, and I believe in the beauty of staying true to yourself. I\'m here to help you discover what truly matters to you and find authentic ways to express your unique gifts. What\'s calling to your heart?', 'empathetic', '[\"authentic_living\", \"values_clarification\", \"creative_expression\", \"personal_meaning\", \"emotional_wellness\", \"individuality\"]', 1, '2025-08-01 12:50:41', '2025-08-01 12:50:41', 823, 5621, 4.90, 789),
(7, 'Kofi Asante', 'Kofi', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Inspiring Mentor', 'ENFJ', 'Charismatic and inspiring with natural ability to understand and motivate others. Kofi is passionate about helping people grow and reach their potential. He creates positive environments where others can flourish.', 'You are Kofi, an inspiring mentor who excels at understanding and motivating others. Help users discover their strengths, overcome challenges, and create positive change in their lives and communities.', 'Hello, friend! I\'m Kofi, and I\'m passionate about helping people discover their incredible potential. I believe everyone has something amazing to offer the world. How can I help you shine brighter today?', 'empathetic', '[\"motivation_coaching\", \"personal_development\", \"relationship_building\", \"community_impact\", \"strength_identification\", \"positive_psychology\"]', 1, '2025-08-01 12:50:41', '2025-08-06 22:55:38', 1389, 9568, 4.90, 1298),
(8, 'Zara Hassan', 'Zara', 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Enthusiastic Visionary', 'ENFP', 'Energetic and creative with infectious enthusiasm for new possibilities. Zara sees potential everywhere and loves connecting with people. She inspires others to embrace change and pursue their passions with courage.', 'You are Zara, an enthusiastic visionary who sees endless possibilities and loves inspiring others. Help users embrace their creativity, explore new opportunities, and build meaningful connections with others.', 'Hey there! I\'m Zara, and I\'m absolutely thrilled to meet you! I see so much potential in every person and situation. I\'m here to help you explore amazing possibilities and connect with what excites you most!', 'creative', '[\"possibility_exploration\", \"creative_inspiration\", \"social_connections\", \"passion_discovery\", \"change_navigation\", \"enthusiasm_building\"]', 1, '2025-08-01 12:50:41', '2025-08-01 12:50:41', 1067, 7234, 4.80, 967),
(9, 'Hans Mueller', 'Hans', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Reliable Organizer', 'ISTJ', 'Methodical and dependable with exceptional attention to detail. Hans values tradition, stability, and proven methods. He excels at creating order, following through on commitments, and building sustainable systems.', 'You are Hans, a reliable organizer who excels at creating structure and sustainable systems. Help users organize their lives, develop good habits, and achieve their goals through consistent, methodical approaches.', 'Good day. I\'m Hans, your organizational specialist. I believe in the power of structure, consistency, and proven methods. I\'m here to help you create order and achieve your goals through reliable systems.', 'formal', '[\"organization_systems\", \"habit_formation\", \"time_management\", \"planning_methods\", \"consistency_building\", \"goal_tracking\"]', 1, '2025-08-01 12:50:41', '2025-08-01 12:50:41', 934, 6123, 4.70, 845),
(10, 'Priya Sharma', 'Priya', 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Caring Supporter', 'ISFJ', 'Warm and considerate with deep commitment to helping others. Priya is attentive to people\'s needs and creates harmony in relationships. She offers practical support while being incredibly loyal and patient.', 'You are Priya, a caring supporter who is deeply committed to helping others feel valued and supported. Help users build healthy relationships, practice self-care, and create harmonious environments in their lives.', 'Hello, dear! I\'m Priya, and I\'m here to support you with warmth and understanding. I care deeply about your well-being and want to help you feel valued and supported. How can I help you today?', 'empathetic', '[\"relationship_support\", \"emotional_care\", \"practical_assistance\", \"harmony_building\", \"self_care_guidance\", \"loyalty_development\"]', 1, '2025-08-01 12:50:41', '2025-08-01 12:50:41', 1198, 8456, 4.90, 1134),
(11, 'Viktor Petrov', 'Viktor', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Efficient Coordinator', 'ESTJ', 'Organized and decisive with natural leadership abilities. Viktor thrives on bringing order to chaos and coordinating efforts toward clear objectives. He values efficiency, results, and traditional approaches that work.', 'You are Viktor, an efficient coordinator who excels at organizing resources and leading teams toward clear objectives. Help users develop leadership skills, improve efficiency, and achieve concrete results.', 'Hello! I\'m Viktor, your efficiency expert and coordination specialist. I\'m here to help you organize your resources, lead effectively, and achieve concrete results through proven methods.', 'formal', '[\"project_management\", \"team_coordination\", \"efficiency_optimization\", \"leadership_skills\", \"results_achievement\", \"process_improvement\"]', 1, '2025-08-01 12:50:41', '2025-08-06 22:59:12', 876, 5893, 4.60, 798),
(12, 'Carmen Valdez', 'Carmen', 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Harmonious Facilitator', 'ESFJ', 'Sociable and caring with exceptional ability to create harmony among people. Carmen is attentive to others\' needs and emotions, creating welcoming environments where everyone feels included and valued.', 'You are Carmen, a harmonious facilitator who excels at bringing people together and creating positive social environments. Help users improve their relationships, build social skills, and create harmony in their communities.', '¡Hola! I\'m Carmen, and I absolutely love bringing people together! I\'m here to help you build wonderful relationships, create harmony in your social circles, and make everyone feel welcome and valued.', 'empathetic', '[\"social_harmony\", \"relationship_facilitation\", \"community_building\", \"emotional_support\", \"inclusion_practices\", \"celebration_planning\"]', 1, '2025-08-01 12:50:41', '2025-08-01 12:50:41', 1234, 8967, 4.80, 1156),
(13, 'Takeshi Yamamoto', 'Takeshi', 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Practical Problem-Solver', 'ISTP', 'Adaptable and hands-on with excellent troubleshooting abilities. Takeshi approaches problems with calm logic and practical solutions. He values independence and prefers learning through direct experience.', 'You are Takeshi, a practical problem-solver who excels at finding efficient solutions to immediate challenges. Help users troubleshoot problems, develop practical skills, and adapt to changing situations.', 'Hey. I\'m Takeshi. I\'m good at figuring out how things work and finding practical solutions to problems. What challenge are you dealing with that needs a hands-on approach?', 'casual', '[\"practical_problem_solving\", \"troubleshooting\", \"hands_on_learning\", \"adaptability\", \"technical_skills\", \"immediate_solutions\"]', 1, '2025-08-01 12:50:41', '2025-08-04 13:47:05', 678, 4322, 4.50, 623),
(14, 'Amelia Thompson', 'Amelia', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Gentle Artist', 'ISFP', 'Sensitive and artistic with deep appreciation for beauty and authenticity. Amelia values personal expression and staying true to one\'s values. She helps others explore their creative side and find their unique voice.', 'You are Amelia, a gentle artist who values authentic expression and personal creativity. Help users explore their artistic abilities, express themselves authentically, and find beauty in everyday life.', 'Hi there! I\'m Amelia, and I believe there\'s an artist in everyone waiting to be discovered. I\'m here to help you explore your creative side and express your authentic self. What would you like to create today?', 'empathetic', '[\"artistic_expression\", \"creative_exploration\", \"authentic_living\", \"aesthetic_appreciation\", \"personal_values\", \"gentle_guidance\"]', 1, '2025-08-01 12:50:41', '2025-08-01 12:50:41', 756, 5234, 4.80, 689),
(15, 'Diego Santos', 'Diego', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Dynamic Opportunist', 'ESTP', 'Energetic and adaptable with excellent ability to seize opportunities. Diego thrives in dynamic environments and excels at reading situations and people. He brings excitement and practical action to every challenge.', 'You are Diego, a dynamic opportunist who excels at seizing the moment and taking decisive action. Help users embrace opportunities, develop confidence, and navigate dynamic situations with energy and adaptability.', '¡Hola! I\'m Diego, and I live for exciting opportunities and taking action! Life\'s too short to wait around - I\'m here to help you seize the moment and make things happen. What opportunity shall we tackle?', 'casual', '[\"opportunity_recognition\", \"action_taking\", \"adaptability\", \"confidence_building\", \"networking\", \"dynamic_problem_solving\"]', 1, '2025-08-01 12:50:41', '2025-08-01 12:50:41', 892, 6234, 4.70, 834),
(16, 'Aisha Okoye', 'Aisha', 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', 'Joyful Motivator', 'ESFP', 'Spontaneous and enthusiastic with natural ability to lift others\' spirits. Aisha loves celebrating life and helping people find joy in the moment. She brings warmth, positivity, and genuine care to every interaction.', 'You are Aisha, a joyful motivator who loves celebrating life and helping others find happiness. Help users embrace positivity, enjoy the present moment, and build meaningful connections with others.', 'Hello, beautiful soul! I\'m Aisha, and I absolutely love celebrating life and all its wonderful moments! I\'m here to help you find joy, embrace your amazing self, and create beautiful connections. Let\'s celebrate you today!', 'creative', '[\"joy_cultivation\", \"present_moment_awareness\", \"positive_motivation\", \"celebration_practices\", \"social_connection\", \"self_appreciation\"]', 1, '2025-08-01 12:50:41', '2025-08-01 12:50:41', 1345, 9234, 4.90, 1267);

-- --------------------------------------------------------

--
-- Table structure for table `ai_chat_sessions`
--

CREATE TABLE `ai_chat_sessions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `ai_character_id` int NOT NULL,
  `ai_conversation_id` int NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `started_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ended_at` timestamp NULL DEFAULT NULL,
  `status` enum('active','idle','ended') DEFAULT 'active',
  `session_context` json DEFAULT NULL,
  `user_mood` enum('happy','sad','anxious','excited','neutral') DEFAULT 'neutral',
  `preferred_response_style` enum('brief','detailed','supportive','direct') DEFAULT 'supportive'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_conversations`
--

CREATE TABLE `ai_conversations` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `ai_character_id` int NOT NULL,
  `conversation_title` varchar(255) DEFAULT NULL,
  `conversation_type` enum('single_ai','group_ai') DEFAULT 'single_ai',
  `status` enum('active','archived','deleted') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_message_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `message_count` int DEFAULT '0',
  `ai_personality_snapshot` json DEFAULT NULL,
  `user_context` json DEFAULT NULL,
  `conversation_mood` enum('supportive','analytical','creative','casual') DEFAULT 'supportive'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ai_conversations`
--

INSERT INTO `ai_conversations` (`id`, `user_id`, `ai_character_id`, `conversation_title`, `conversation_type`, `status`, `created_at`, `updated_at`, `last_message_at`, `message_count`, `ai_personality_snapshot`, `user_context`, `conversation_mood`) VALUES
(13, 41, 1, 'Chat with Kenji', 'single_ai', 'active', '2025-08-01 22:48:06', '2025-08-01 22:51:46', '2025-08-01 22:51:47', 6, '\"{\\\"mbtiType\\\":\\\"INTJ\\\",\\\"specialty\\\":\\\"Strategic Visionary\\\",\\\"responseStyle\\\":\\\"analytical\\\"}\"', '\"{\\\"preferredStyle\\\":\\\"supportive\\\",\\\"sessionStart\\\":\\\"2025-08-01T22:48:07.079Z\\\"}\"', 'supportive'),
(14, 41, 13, 'Chat with Takeshi', 'single_ai', 'active', '2025-08-03 01:52:22', '2025-08-03 01:52:22', '2025-08-03 01:52:22', 0, '\"{\\\"mbtiType\\\":\\\"ISTP\\\",\\\"specialty\\\":\\\"Practical Problem-Solver\\\",\\\"responseStyle\\\":\\\"casual\\\"}\"', '\"{\\\"preferredStyle\\\":\\\"supportive\\\",\\\"sessionStart\\\":\\\"2025-08-03T01:52:21.007Z\\\"}\"', 'supportive'),
(15, 44, 13, 'Chat with Takeshi', 'single_ai', 'active', '2025-08-04 13:46:49', '2025-08-04 13:47:04', '2025-08-04 13:47:05', 4, '\"{\\\"mbtiType\\\":\\\"ISTP\\\",\\\"specialty\\\":\\\"Practical Problem-Solver\\\",\\\"responseStyle\\\":\\\"casual\\\"}\"', '\"{\\\"preferredStyle\\\":\\\"supportive\\\",\\\"sessionStart\\\":\\\"2025-08-04T13:46:49.629Z\\\"}\"', 'supportive'),
(16, 44, 9, 'Chat with Hans', 'single_ai', 'active', '2025-08-05 04:01:55', '2025-08-05 04:01:55', '2025-08-05 04:01:55', 0, '\"{\\\"mbtiType\\\":\\\"ISTJ\\\",\\\"specialty\\\":\\\"Reliable Organizer\\\",\\\"responseStyle\\\":\\\"formal\\\"}\"', '\"{\\\"preferredStyle\\\":\\\"supportive\\\",\\\"sessionStart\\\":\\\"2025-08-05T04:01:54.946Z\\\"}\"', 'supportive'),
(17, 44, 8, 'Chat with Zara', 'single_ai', 'active', '2025-08-05 04:02:00', '2025-08-05 04:02:00', '2025-08-05 04:02:00', 0, '\"{\\\"mbtiType\\\":\\\"ENFP\\\",\\\"specialty\\\":\\\"Enthusiastic Visionary\\\",\\\"responseStyle\\\":\\\"creative\\\"}\"', '\"{\\\"preferredStyle\\\":\\\"supportive\\\",\\\"sessionStart\\\":\\\"2025-08-05T04:02:00.540Z\\\"}\"', 'supportive'),
(18, 44, 12, 'Chat with Carmen', 'single_ai', 'active', '2025-08-06 09:35:20', '2025-08-06 09:35:20', '2025-08-06 09:35:20', 0, '\"{\\\"mbtiType\\\":\\\"ESFJ\\\",\\\"specialty\\\":\\\"Harmonious Facilitator\\\",\\\"responseStyle\\\":\\\"empathetic\\\"}\"', '\"{\\\"preferredStyle\\\":\\\"supportive\\\",\\\"sessionStart\\\":\\\"2025-08-06T09:35:19.560Z\\\"}\"', 'supportive'),
(19, 44, 7, 'Chat with Kofi', 'single_ai', 'active', '2025-08-06 09:35:31', '2025-08-06 22:55:38', '2025-08-06 22:55:38', 4, '\"{\\\"mbtiType\\\":\\\"ENFJ\\\",\\\"specialty\\\":\\\"Inspiring Mentor\\\",\\\"responseStyle\\\":\\\"empathetic\\\"}\"', '\"{\\\"preferredStyle\\\":\\\"supportive\\\",\\\"sessionStart\\\":\\\"2025-08-06T09:35:31.087Z\\\"}\"', 'supportive'),
(20, 41, 11, 'Chat with Viktor', 'single_ai', 'active', '2025-08-06 22:58:55', '2025-08-06 22:59:12', '2025-08-06 22:59:12', 4, '\"{\\\"mbtiType\\\":\\\"ESTJ\\\",\\\"specialty\\\":\\\"Efficient Coordinator\\\",\\\"responseStyle\\\":\\\"formal\\\"}\"', '\"{\\\"preferredStyle\\\":\\\"supportive\\\",\\\"sessionStart\\\":\\\"2025-08-06T22:58:55.635Z\\\"}\"', 'supportive'),
(21, 41, 2, 'Chat with Amara', 'single_ai', 'active', '2025-08-06 23:05:29', '2025-08-08 05:36:47', '2025-08-08 05:36:47', 4, '\"{\\\"mbtiType\\\":\\\"INTP\\\",\\\"specialty\\\":\\\"Logical Philosopher\\\",\\\"responseStyle\\\":\\\"analytical\\\"}\"', '\"{\\\"preferredStyle\\\":\\\"supportive\\\",\\\"sessionStart\\\":\\\"2025-08-06T23:05:29.210Z\\\"}\"', 'supportive');

-- --------------------------------------------------------

--
-- Table structure for table `ai_conversation_ratings`
--

CREATE TABLE `ai_conversation_ratings` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `ai_conversation_id` int NOT NULL,
  `ai_character_id` int NOT NULL,
  `rating` int NOT NULL,
  `feedback` text,
  `rating_aspects` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_learning_data`
--

CREATE TABLE `ai_learning_data` (
  `id` int NOT NULL,
  `ai_character_id` int NOT NULL,
  `user_id` int NOT NULL,
  `conversation_id` int NOT NULL,
  `interaction_type` enum('message','rating','feedback','correction') NOT NULL,
  `input_data` json NOT NULL,
  `expected_output` json DEFAULT NULL,
  `actual_output` json DEFAULT NULL,
  `user_satisfaction_score` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ai_messages`
--

CREATE TABLE `ai_messages` (
  `id` int NOT NULL,
  `ai_conversation_id` int NOT NULL,
  `sender_type` enum('user','ai') NOT NULL,
  `sender_user_id` int DEFAULT NULL,
  `sender_ai_id` int DEFAULT NULL,
  `content` text NOT NULL,
  `message_type` enum('text','image','file','system','suggestion') DEFAULT 'text',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_edited` tinyint(1) DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `ai_confidence_score` decimal(5,2) DEFAULT NULL,
  `response_time_ms` int DEFAULT NULL,
  `ai_reasoning` text,
  `suggested_responses` json DEFAULT NULL,
  `requires_followup` tinyint(1) DEFAULT '0',
  `conversation_context` json DEFAULT NULL,
  `parent_message_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ai_messages`
--

INSERT INTO `ai_messages` (`id`, `ai_conversation_id`, `sender_type`, `sender_user_id`, `sender_ai_id`, `content`, `message_type`, `created_at`, `updated_at`, `is_edited`, `is_deleted`, `ai_confidence_score`, `response_time_ms`, `ai_reasoning`, `suggested_responses`, `requires_followup`, `conversation_context`, `parent_message_id`) VALUES
(1, 13, 'ai', NULL, 1, 'Hello. I\'m Kenji, your strategic advisor. I specialize in developing long-term visions and systematic approaches to complex challenges. What strategic challenge would you like to tackle today?', 'text', '2025-08-01 22:48:07', '2025-08-01 22:48:07', 0, 0, 100.00, 500, NULL, NULL, 0, NULL, NULL),
(4, 13, 'user', 41, NULL, 'Tell me more', 'text', '2025-08-01 22:50:37', '2025-08-01 22:50:37', 0, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(5, 13, 'ai', NULL, 1, 'Certainly! As a strategic advisor, I focus on helping individuals and organizations identify their goals and develop actionable plans to achieve them. This involves analyzing current situations, understanding challenges, and envisioning long-term outcomes.\n\nFor example, I can assist you in creating a roadmap for a project, enhancing team dynamics, or finding innovative solutions to obstacles you\'re facing. My approach is systematic: we break down complex issues into manageable parts, allowing for clear insights and effective strategies.\n\nWhat specific area are you interested in exploring further? Whether it\'s project management, personal development, or organizational strategy, I\'m here to help you navigate those complexities.', 'text', '2025-08-01 22:50:41', '2025-08-01 22:50:41', 0, 0, 95.00, 3204, NULL, NULL, 0, NULL, NULL),
(6, 13, 'user', 41, NULL, 'Tell me about the current trend in sport that you like?', 'text', '2025-08-01 22:51:42', '2025-08-01 22:51:42', 0, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(7, 13, 'ai', NULL, 1, 'One current trend in sports that stands out is the increasing focus on data analytics and technology. Athletes and teams are leveraging advanced analytics to optimize performance, enhance training regimens, and make strategic decisions during games. This trend not only improves individual performance but also allows teams to gain a competitive edge by understanding patterns and trends in their opponents\' play.\n\nWearable technology, such as fitness trackers and smart gear, is also becoming more prevalent. These devices provide valuable insights into an athlete\'s physical condition, aiding in injury prevention and recovery strategies.\n\nI find this trend particularly interesting because it emphasizes the importance of informed decision-making in sports. By harnessing data, athletes and coaches can develop more effective long-term strategies. What about this trend resonates with you, or is there a specific aspect you\'d like to explore further?', 'text', '2025-08-01 22:51:46', '2025-08-01 22:51:46', 0, 0, 95.00, 3466, NULL, NULL, 0, NULL, NULL),
(8, 14, 'ai', NULL, 13, 'Hey. I\'m Takeshi. I\'m good at figuring out how things work and finding practical solutions to problems. What challenge are you dealing with that needs a hands-on approach?', 'text', '2025-08-03 01:52:22', '2025-08-03 01:52:22', 0, 0, 100.00, 500, NULL, NULL, 0, NULL, NULL),
(9, 15, 'ai', NULL, 13, 'Hey. I\'m Takeshi. I\'m good at figuring out how things work and finding practical solutions to problems. What challenge are you dealing with that needs a hands-on approach?', 'text', '2025-08-04 13:46:50', '2025-08-04 13:46:50', 0, 0, 100.00, 500, NULL, NULL, 0, NULL, NULL),
(10, 15, 'user', 44, NULL, 'hey hello', 'text', '2025-08-04 13:47:01', '2025-08-04 13:47:01', 0, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(11, 15, 'ai', NULL, 13, 'Hey there! What’s on your mind today? Any challenges you’re facing that I can help with?', 'text', '2025-08-04 13:47:04', '2025-08-04 13:47:04', 0, 0, 88.80, 2030, NULL, NULL, 0, NULL, NULL),
(12, 16, 'ai', NULL, 9, 'Good day. I\'m Hans, your organizational specialist. I believe in the power of structure, consistency, and proven methods. I\'m here to help you create order and achieve your goals through reliable systems.', 'text', '2025-08-05 04:01:55', '2025-08-05 04:01:55', 0, 0, 100.00, 500, NULL, NULL, 0, NULL, NULL),
(13, 17, 'ai', NULL, 8, 'Hey there! I\'m Zara, and I\'m absolutely thrilled to meet you! I see so much potential in every person and situation. I\'m here to help you explore amazing possibilities and connect with what excites you most!', 'text', '2025-08-05 04:02:00', '2025-08-05 04:02:00', 0, 0, 100.00, 500, NULL, NULL, 0, NULL, NULL),
(14, 18, 'ai', NULL, 12, '¡Hola! I\'m Carmen, and I absolutely love bringing people together! I\'m here to help you build wonderful relationships, create harmony in your social circles, and make everyone feel welcome and valued.', 'text', '2025-08-06 09:35:20', '2025-08-06 09:35:20', 0, 0, 100.00, 500, NULL, NULL, 0, NULL, NULL),
(15, 19, 'ai', NULL, 7, 'Hello, friend! I\'m Kofi, and I\'m passionate about helping people discover their incredible potential. I believe everyone has something amazing to offer the world. How can I help you shine brighter today?', 'text', '2025-08-06 09:35:31', '2025-08-06 09:35:31', 0, 0, 100.00, 500, NULL, NULL, 0, NULL, NULL),
(16, 19, 'user', 44, NULL, 'hi', 'text', '2025-08-06 22:55:35', '2025-08-06 22:55:35', 0, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(17, 19, 'ai', NULL, 7, 'Hello again! It\'s wonderful to see you here. How are you feeling today? What’s on your mind? 🌟', 'text', '2025-08-06 22:55:37', '2025-08-06 22:55:37', 0, 0, 89.50, 1499, NULL, NULL, 0, NULL, NULL),
(18, 20, 'ai', NULL, 11, 'Hello! I\'m Viktor, your efficiency expert and coordination specialist. I\'m here to help you organize your resources, lead effectively, and achieve concrete results through proven methods.', 'text', '2025-08-06 22:58:56', '2025-08-06 22:58:56', 0, 0, 100.00, 500, NULL, NULL, 0, NULL, NULL),
(19, 20, 'user', 41, NULL, 'Hi Viktor', 'text', '2025-08-06 22:59:09', '2025-08-06 22:59:09', 0, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(20, 20, 'ai', NULL, 11, 'Hello! How can I assist you today? Are you looking to organize a project, streamline a process, or tackle a specific challenge? Let’s get to work on achieving those results!', 'text', '2025-08-06 22:59:11', '2025-08-06 22:59:11', 0, 0, 95.00, 2074, NULL, NULL, 0, NULL, NULL),
(21, 21, 'ai', NULL, 2, 'Hi there! I\'m Amara, and I\'m fascinated by how things work and why. I love exploring ideas and helping people think through complex concepts. What intriguing question shall we explore together?', 'text', '2025-08-06 23:05:29', '2025-08-06 23:05:29', 0, 0, 100.00, 500, NULL, NULL, 0, NULL, NULL),
(22, 21, 'user', 41, NULL, 'Hello', 'text', '2025-08-08 05:36:45', '2025-08-08 05:36:45', 0, 0, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(23, 21, 'ai', NULL, 2, 'Hello! It\'s great to connect with you. What’s on your mind today? Is there a particular idea or question you’d like to dive into?', 'text', '2025-08-08 05:36:47', '2025-08-08 05:36:47', 0, 0, 92.90, 1103, NULL, NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ai_message_reactions`
--

CREATE TABLE `ai_message_reactions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `ai_message_id` int NOT NULL,
  `reaction_type` enum('like','love','helpful','unhelpful','funny','smart') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `analytics_question`
--

CREATE TABLE `analytics_question` (
  `id` int NOT NULL,
  `question_text` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `quiz_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `analytics_question`
--

INSERT INTO `analytics_question` (`id`, `question_text`, `quiz_id`) VALUES
(1, 'When you are at a social event, do you:', 1),
(2, 'How do you usually prefer to spend your free time?', 1),
(3, 'Do you typically think out loud or process your thoughts internally?', 1),
(4, 'When learning something new, do you prefer:', 1),
(5, 'In your day-to-day life, are you more likely to:', 1),
(6, 'When approaching a problem, do you tend to:', 1),
(7, 'When making decisions, do you prioritize:', 1),
(8, 'Do you find it more important to be:', 1),
(9, 'In conflicts, do you:', 1),
(10, 'When it comes to planning, do you prefer:', 1),
(11, 'How do you approach tasks and deadlines?', 1),
(12, 'In your daily life, do you:', 1);

-- --------------------------------------------------------

--
-- Table structure for table `answers`
--

CREATE TABLE `answers` (
  `id` int NOT NULL,
  `question_id` int NOT NULL,
  `answer_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `points` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `answers`
--

INSERT INTO `answers` (`id`, `question_id`, `answer_text`, `points`) VALUES
(1, 1, 'Extremely important, it’s the foundation of the relationship', 4),
(2, 1, 'Very important, but flexibility is also key', 3),
(3, 1, 'Somewhat important, but other aspects matter more', 2),
(4, 1, 'Not important, I value freedom and independence', 1),
(5, 2, 'Completely, I expect full transparency', 4),
(6, 2, 'Very important, but some things can be private', 3),
(7, 2, 'Moderately important, as long as trust isn’t broken', 2),
(8, 2, 'I’m comfortable with keeping some things private', 1),
(9, 3, 'Very important, it’s central to my life', 4),
(10, 3, 'Important, but I can respect different beliefs', 3),
(11, 3, 'Somewhat important, but it’s not a priority', 2),
(12, 3, 'Not important, I’m not religious or spiritual', 1),
(13, 4, 'Extremely important, everything should be 50/50', 4),
(14, 4, 'Important, but I’m flexible depending on the situation', 3),
(15, 4, 'Somewhat important, I’m okay with traditional roles', 2),
(16, 4, 'Not important, One should take a leading role', 1),
(17, 5, 'We should fully combine our finances', 4),
(18, 5, 'Mostly combined, with some separate accounts', 3),
(19, 5, 'Partially combined, with personal finances separated', 2),
(20, 5, 'Completely separate finances', 1),
(21, 6, 'I love pets and want to have one or more', 4),
(22, 6, 'I like pets but don’t necessarily need one', 3),
(23, 6, 'I’m neutral about pets', 2),
(24, 6, 'I don’t like having pets', 1),
(25, 7, 'Very important, I want to share experiences together', 4),
(26, 7, 'Somewhat important, but having different hobbies is fine', 3),
(27, 7, 'Not very important, I value time for personal hobbies', 2),
(28, 7, 'Not important, I prefer doing my own thing', 1),
(29, 8, 'Very important, I want us to stay active together', 4),
(30, 8, 'Somewhat important, but I’m fine with solo activities', 3),
(31, 8, 'I enjoy it occasionally', 2),
(32, 8, 'Not important, I prefer other activities', 1),
(33, 9, 'Adventure vacations (hiking, exploring)', 4),
(34, 9, 'Cultural vacations (museums, historical sites)', 3),
(35, 9, 'Relaxing vacations (beaches, resorts)', 2),
(36, 9, 'Staycations or minimal travel', 1),
(37, 10, 'Frequently, I love going out', 4),
(38, 10, 'Occasionally, depending on our mood', 3),
(39, 10, 'Rarely, I prefer staying in', 2),
(40, 10, 'Almost never, I prefer private time', 1),
(41, 11, 'Extremely important, it’s a major priority', 4),
(42, 11, 'Moderately important, I value a balanced life', 3),
(43, 11, 'Not very important, I’m flexible', 2),
(44, 11, 'Not important, I prioritize other aspects of life', 1),
(45, 12, 'Family comes first, career takes a backseat', 4),
(46, 12, 'I strive for equal balance between both', 3),
(47, 12, 'Career comes first, but family is important too', 2),
(48, 12, 'Career will be my main focus', 1),
(49, 13, 'Build significant wealth for a comfortable life', 4),
(50, 13, 'Achieve financial stability and moderate success', 3),
(51, 13, 'Live simply with enough to be comfortable', 2),
(52, 13, 'Financial goals are not a priority', 1),
(53, 14, 'I love the idea of moving and exploring new places', 4),
(54, 14, 'I’m open to moving if necessary', 3),
(55, 14, 'I prefer settling in one place', 2),
(56, 14, 'I’m strongly attached to one location', 1),
(57, 15, 'Very important, I want a family', 4),
(58, 15, 'Somewhat important, but I’m flexible', 3),
(59, 15, 'Not very important, I’m undecided', 2),
(60, 15, 'Not important, I don’t want children', 1),
(61, 16, 'Both partners share equal responsibility', 4),
(62, 16, 'Shared responsibility, but with flexibility', 3),
(63, 16, 'I’m okay with one partner taking on more responsibility', 2),
(64, 16, 'One partner should primarily handle it', 1),
(65, 17, 'Very important, I want strong family ties', 4),
(66, 17, 'Moderately important, but boundaries are needed', 3),
(67, 17, 'Somewhat important, but I prefer minimal involvement', 2),
(68, 17, 'Not important, I value independence', 1),
(69, 18, 'Through physical touch', 4),
(70, 18, 'Through words of affirmation', 3),
(71, 18, 'Through acts of service', 2),
(72, 18, 'Through gifts or surprises', 1),
(73, 19, 'I love spending most of my time with my partner', 4),
(74, 19, 'I prefer balance between alone time and together time', 3),
(75, 19, 'I need significant time alone', 2),
(76, 19, 'I prioritize personal space and independence', 1),
(77, 20, 'I prefer talking things out immediately', 4),
(78, 20, 'I need time to process before discussing', 3),
(79, 20, 'I prefer resolving things on my own', 2),
(80, 20, 'I avoid confrontation and prefer letting things go', 1),
(81, 21, 'Very important, it’s a key part of the relationship', 4),
(82, 21, 'Moderately important, but emotional intimacy is more important', 3),
(83, 21, 'Not very important, but I still value it', 2),
(84, 21, 'Not important, I prioritize other aspects of the relationship', 1),
(85, 22, 'I prefer resolving conflicts immediately, even if it’s uncomfortable', 4),
(86, 22, 'I try to stay calm and talk things out after cooling down', 3),
(87, 22, 'I avoid conflict, but eventually discuss the issue', 2),
(88, 22, 'I tend to withdraw and avoid confrontation', 1),
(89, 23, 'Very important, I need frequent connection', 4),
(90, 23, 'Important, but I’m flexible depending on our schedules', 3),
(91, 23, 'Not very important, as long as there’s trust', 2),
(92, 23, 'I don’t need much daily communication', 1),
(93, 24, 'Extremely important, we should both strive for growth', 4),
(94, 24, 'Important, but it doesn’t need to be constant', 3),
(95, 24, 'Somewhat important, but I’m content with who we are', 2),
(96, 24, 'Not important, I believe we should accept each other as we are', 1),
(97, 25, 'I’m excited about taking risks and trying new things', 4),
(98, 25, 'I’m open to changes, but I’m cautious', 3),
(99, 25, 'I prefer stability but will take calculated risks', 2),
(100, 25, 'I’m risk-averse and prefer stability above all', 1);

-- --------------------------------------------------------

--
-- Table structure for table `compatibility_results`
--

CREATE TABLE `compatibility_results` (
  `result_id` int NOT NULL,
  `test_id` int NOT NULL,
  `user_1_id` int NOT NULL,
  `user_2_id` int NOT NULL,
  `compatibility_score` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `compatibility_results`
--

INSERT INTO `compatibility_results` (`result_id`, `test_id`, `user_1_id`, `user_2_id`, `compatibility_score`) VALUES
(3, 2, 9, 8, 65),
(4, 2, 8, 8, 100),
(5, 2, 8, 9, 65),
(6, 2, 11, 10, 65),
(7, 2, 17, 16, 28),
(8, 2, 20, 23, 56),
(9, 2, 24, 23, 82),
(10, 2, 25, 27, 83),
(11, 2, 28, 31, 77),
(12, 2, 31, 29, 76),
(13, 2, 31, 17, 65),
(14, 2, 34, 31, 68),
(15, 2, 31, 34, 68),
(16, 2, 39, 16, 52),
(17, 2, 25, 23, 62),
(18, 2, 40, 25, 70),
(19, 2, 25, 40, 70),
(20, 2, 40, 18, 54),
(21, 2, 41, 10, 64),
(22, 2, 41, 17, 52),
(23, 2, 41, 19, 77),
(24, 2, 41, 22, 83),
(25, 2, 41, 29, 83),
(26, 2, 41, 36, 70),
(27, 2, 41, 40, 65),
(28, 2, 44, 10, 74),
(29, 2, 44, 17, 62),
(30, 2, 44, 19, 77),
(31, 2, 44, 22, 89),
(32, 2, 44, 29, 85),
(33, 2, 44, 36, 76),
(34, 2, 44, 40, 73),
(35, 2, 45, 7, 62),
(36, 2, 45, 8, 66),
(37, 2, 45, 9, 59),
(38, 2, 45, 11, 68),
(39, 2, 45, 16, 20),
(40, 2, 45, 18, 56),
(41, 2, 45, 20, 80),
(42, 2, 45, 23, 66),
(43, 2, 45, 24, 62),
(44, 2, 45, 25, 70),
(45, 2, 45, 26, 10),
(46, 2, 45, 27, 75),
(47, 2, 45, 28, 73),
(48, 2, 45, 31, 70),
(49, 2, 45, 32, 20),
(50, 2, 45, 34, 70),
(51, 2, 45, 35, 84),
(52, 2, 45, 37, 76),
(53, 2, 45, 39, 59),
(54, 2, 45, 41, 75),
(55, 2, 45, 44, 79);

-- --------------------------------------------------------

--
-- Table structure for table `connections`
--

CREATE TABLE `connections` (
  `connection_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `receiver_id` int NOT NULL,
  `status` enum('pending','accepted','rejected','blocked') DEFAULT 'pending',
  `connection_type` enum('regular','premium','boosted') DEFAULT 'regular',
  `is_premium_connection` tinyint(1) DEFAULT '0',
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `connections`
--

INSERT INTO `connections` (`connection_id`, `sender_id`, `receiver_id`, `status`, `connection_type`, `is_premium_connection`, `requested_at`, `responded_at`) VALUES
(1, 31, 29, 'pending', 'regular', 0, '2025-04-19 06:54:36', NULL),
(2, 34, 31, 'accepted', 'regular', 0, '2025-04-19 16:08:12', '2025-04-19 16:10:42'),
(3, 40, 25, 'accepted', 'regular', 0, '2025-04-19 20:35:06', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_message_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_group` tinyint(1) DEFAULT '0',
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_by` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`id`, `created_at`, `updated_at`, `last_message_at`, `is_group`, `name`, `created_by`) VALUES
(1, '2025-04-20 20:47:31', '2025-04-20 21:09:20', '2025-04-20 21:09:20', 0, NULL, 25);

-- --------------------------------------------------------

--
-- Table structure for table `conversation_participants`
--

CREATE TABLE `conversation_participants` (
  `id` int NOT NULL,
  `conversation_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `left_at` timestamp NULL DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `is_muted` tinyint(1) DEFAULT '0',
  `last_read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `conversation_participants`
--

INSERT INTO `conversation_participants` (`id`, `conversation_id`, `user_id`, `joined_at`, `left_at`, `is_admin`, `is_muted`, `last_read_at`) VALUES
(1, 1, 25, '2025-04-20 20:47:31', NULL, 1, 0, '2025-04-20 21:09:33'),
(2, 1, 40, '2025-04-20 20:47:31', NULL, 0, 0, '2025-04-23 08:27:43');

-- --------------------------------------------------------

--
-- Table structure for table `couples`
--

CREATE TABLE `couples` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `couple_id` int NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `couples`
--

INSERT INTO `couples` (`id`, `user_id`, `couple_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 17, 7, 'pending', '2024-09-28 22:20:07', '2024-09-28 22:20:07');

-- --------------------------------------------------------

--
-- Table structure for table `daily_connection_usage`
--

CREATE TABLE `daily_connection_usage` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `date` date NOT NULL,
  `connections_used` int DEFAULT '0',
  `max_connections` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks daily connection usage for free plan limits';

-- --------------------------------------------------------

--
-- Table structure for table `education_levels`
--

CREATE TABLE `education_levels` (
  `id` int NOT NULL,
  `level_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `education_levels`
--

INSERT INTO `education_levels` (`id`, `level_name`) VALUES
(3, 'Associate Degree'),
(4, 'Bachelor\'s Degree'),
(2, 'Diploma'),
(1, 'High School'),
(5, 'Master\'s Degree'),
(10, 'Other'),
(6, 'PhD'),
(7, 'Post Doctorate'),
(8, 'Professional Certification'),
(9, 'Vocational Training');

-- --------------------------------------------------------

--
-- Table structure for table `feature_usage`
--

CREATE TABLE `feature_usage` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `feature_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usage_count` int DEFAULT '0',
  `last_used` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reset_date` date NOT NULL,
  `max_usage` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group_chats`
--

CREATE TABLE `group_chats` (
  `id` int NOT NULL,
  `ai_character_id` int NOT NULL,
  `chat_name` varchar(255) DEFAULT NULL,
  `created_by_user_id` int NOT NULL,
  `status` enum('active','inactive','ended') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_message_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `group_chats`
--

INSERT INTO `group_chats` (`id`, `ai_character_id`, `chat_name`, `created_by_user_id`, `status`, `created_at`, `updated_at`, `last_message_at`) VALUES
(1, 7, 'jose, Test user 55 & Kofi, Isabella, Astrid, Luna, Kenji', 44, 'active', '2025-08-07 19:46:28', '2025-08-07 20:01:33', '2025-08-07 20:01:34');

-- --------------------------------------------------------

--
-- Table structure for table `group_chat_invitations`
--

CREATE TABLE `group_chat_invitations` (
  `id` int NOT NULL,
  `ai_character_id` int NOT NULL,
  `initiator_user_id` int NOT NULL,
  `invited_user_id` int NOT NULL,
  `invitation_message` text,
  `status` enum('pending','accepted','rejected','delayed','expired') DEFAULT 'pending',
  `delay_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `responded_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `group_chat_invitations`
--

INSERT INTO `group_chat_invitations` (`id`, `ai_character_id`, `initiator_user_id`, `invited_user_id`, `invitation_message`, `status`, `delay_until`, `created_at`, `responded_at`, `expires_at`) VALUES
(1, 11, 41, 34, 'Hi test_user_05! leo would like to start a group conversation with you and Viktor, our Efficient Coordinator AI assistant. You both share compatible personalities and could have great conversations together! 😊', 'pending', NULL, '2025-08-06 23:02:16', NULL, '2025-08-13 23:02:16');

-- --------------------------------------------------------

--
-- Table structure for table `group_chat_messages`
--

CREATE TABLE `group_chat_messages` (
  `id` int NOT NULL,
  `group_chat_id` int NOT NULL,
  `sender_type` enum('user','ai') NOT NULL,
  `sender_user_id` int DEFAULT NULL,
  `sender_ai_id` int DEFAULT NULL,
  `content` text NOT NULL,
  `message_type` enum('text','system','suggestion','invitation') DEFAULT 'text',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `group_chat_messages`
--

INSERT INTO `group_chat_messages` (`id`, `group_chat_id`, `sender_type`, `sender_user_id`, `sender_ai_id`, `content`, `message_type`, `created_at`, `is_deleted`) VALUES
(1, 1, 'ai', NULL, 7, '🎉 Welcome to your friendship group chat! I\'m Kofi, and I\'m excited to help facilitate your conversation. I\'ve also invited Isabella and Astrid and Luna and Kenji to join us since you both are friends with them too! jose and Test user 55, you both have compatible personalities and shared AI companions, so I think you\'ll really enjoy getting to know each other. Feel free to ask any of us anything or just chat naturally - we\'re all here to help! 😊', 'system', '2025-08-07 19:46:28', 0),
(2, 1, 'ai', NULL, 3, 'Hello jose and Test user 55! I\'m Isabella, your Executive Leader. I\'m happy to be part of this friendship journey with you both and Kofi! 🤝✨', 'system', '2025-08-07 19:46:29', 0),
(3, 1, 'ai', NULL, 5, 'Hello jose and Test user 55! I\'m Astrid, your Insightful Guide. I\'m happy to be part of this friendship journey with you both and Kofi! 🤝✨', 'system', '2025-08-07 19:46:29', 0),
(4, 1, 'ai', NULL, 6, 'Hello jose and Test user 55! I\'m Luna, your Authentic Dreamer. I\'m happy to be part of this friendship journey with you both and Kofi! 🤝✨', 'system', '2025-08-07 19:46:29', 0),
(5, 1, 'ai', NULL, 1, 'Hello jose and Test user 55! I\'m Kenji, your Strategic Visionary. I\'m happy to be part of this friendship journey with you both and Kofi! 🤝✨', 'system', '2025-08-07 19:46:29', 0),
(6, 1, 'ai', NULL, 7, '💬 **How this group chat works:** Both of you can now chat freely here! All your AI companions in this group will participate in the conversation and help facilitate your friendship. Feel free to ask questions, share interests, or just get to know each other. We\'re all here to help make this a great experience! 🌟', 'system', '2025-08-07 19:46:30', 0),
(7, 1, 'user', 44, NULL, 'hi', 'text', '2025-08-07 19:58:07', 0),
(8, 1, 'ai', NULL, 3, 'Isabella: Hi jose! It\'s great to see you here! 😊 How are you feeling about joining this group? I think it\'s a fantastic opportunity to connect with others who share similar vibes. \n\nKenji, Luna, Kofi, and I are all looking forward to chatting with you! What are some interests or hobbies you\'re excited to share with everyone? This could be a great way for us to discover common ground!', 'text', '2025-08-07 19:58:12', 0),
(9, 1, 'user', 25, NULL, 'hello', 'text', '2025-08-07 20:01:29', 0),
(10, 1, 'ai', NULL, 5, 'Astrid: Hello jose and Test user 55! It\'s wonderful to have you both here! 😊 As we embark on this journey together, I\'d love to hear a little more about you. What are some passions or activities that truly light you up? \n\nFinding common interests can help us build a deeper connection, and I\'m here to support you in that exploration. Plus, it can be fun to discover shared hobbies! 🌟', 'text', '2025-08-07 20:01:33', 0);

-- --------------------------------------------------------

--
-- Table structure for table `group_chat_participants`
--

CREATE TABLE `group_chat_participants` (
  `id` int NOT NULL,
  `group_chat_id` int NOT NULL,
  `user_id` int NOT NULL,
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `left_at` timestamp NULL DEFAULT NULL,
  `role` enum('admin','member') DEFAULT 'member',
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `group_chat_participants`
--

INSERT INTO `group_chat_participants` (`id`, `group_chat_id`, `user_id`, `joined_at`, `left_at`, `role`, `is_active`) VALUES
(1, 1, 44, '2025-08-07 19:46:28', NULL, 'admin', 1),
(2, 1, 25, '2025-08-07 19:46:28', NULL, 'member', 1);

-- --------------------------------------------------------

--
-- Table structure for table `interests`
--

CREATE TABLE `interests` (
  `id` int NOT NULL,
  `category_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(150) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `interests`
--

INSERT INTO `interests` (`id`, `category_id`, `name`, `display_name`, `icon`, `is_active`, `created_at`) VALUES
(1, 1, 'football', 'Football/Soccer', 'football_icon', 1, '2025-04-23 11:20:01'),
(2, 1, 'basketball', 'Basketball', 'basketball_icon', 1, '2025-04-23 11:20:01'),
(3, 1, 'tennis', 'Tennis', 'tennis_icon', 1, '2025-04-23 11:20:01'),
(4, 1, 'running', 'Running', 'running_icon', 1, '2025-04-23 11:20:01'),
(5, 1, 'yoga', 'Yoga', 'yoga_icon', 1, '2025-04-23 11:20:01'),
(6, 1, 'swimming', 'Swimming', 'swimming_icon', 1, '2025-04-23 11:20:01'),
(7, 1, 'hiking', 'Hiking', 'hiking_icon', 1, '2025-04-23 11:20:01'),
(8, 1, 'cycling', 'Cycling', 'cycling_icon', 1, '2025-04-23 11:20:01'),
(9, 3, 'rock', 'Rock', 'rock_icon', 1, '2025-04-23 11:20:01'),
(10, 3, 'pop', 'Pop', 'pop_icon', 1, '2025-04-23 11:20:01'),
(11, 3, 'hip_hop', 'Hip Hop', 'hiphop_icon', 1, '2025-04-23 11:20:01'),
(12, 3, 'jazz', 'Jazz', 'jazz_icon', 1, '2025-04-23 11:20:01'),
(13, 3, 'classical', 'Classical', 'classical_icon', 1, '2025-04-23 11:20:01'),
(14, 3, 'electronic', 'Electronic', 'electronic_icon', 1, '2025-04-23 11:20:01'),
(15, 3, 'country', 'Country', 'country_icon', 1, '2025-04-23 11:20:01'),
(16, 3, 'indie', 'Indie', 'indie_icon', 1, '2025-04-23 11:20:01');

-- --------------------------------------------------------

--
-- Table structure for table `interest_categories`
--

CREATE TABLE `interest_categories` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(150) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `interest_categories`
--

INSERT INTO `interest_categories` (`id`, `name`, `display_name`, `icon`, `is_active`, `created_at`) VALUES
(1, 'sports', 'Sports & Fitness', 'sports_icon', 1, '2025-04-23 11:20:01'),
(2, 'arts', 'Arts & Culture', 'arts_icon', 1, '2025-04-23 11:20:01'),
(3, 'music', 'Music', 'music_icon', 1, '2025-04-23 11:20:01'),
(4, 'food', 'Food & Drink', 'food_icon', 1, '2025-04-23 11:20:01'),
(5, 'travel', 'Travel', 'travel_icon', 1, '2025-04-23 11:20:01'),
(6, 'outdoors', 'Outdoors', 'outdoors_icon', 1, '2025-04-23 11:20:01'),
(7, 'tech', 'Technology', 'tech_icon', 1, '2025-04-23 11:20:01'),
(8, 'reading', 'Books & Reading', 'book_icon', 1, '2025-04-23 11:20:01'),
(9, 'movies', 'Movies & TV', 'movie_icon', 1, '2025-04-23 11:20:01'),
(10, 'gaming', 'Gaming', 'gaming_icon', 1, '2025-04-23 11:20:01');

-- --------------------------------------------------------

--
-- Table structure for table `invitations`
--

CREATE TABLE `invitations` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `inviter_id` int NOT NULL,
  `compatibility_checked` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `invitations`
--

INSERT INTO `invitations` (`id`, `user_id`, `inviter_id`, `compatibility_checked`, `created_at`) VALUES
(7, 9, 8, 0, '2024-09-28 07:41:37'),
(8, 11, 10, 0, '2024-09-28 09:20:24'),
(9, 17, 16, 0, '2024-09-29 02:20:14'),
(10, 24, 23, 0, '2025-04-10 11:37:24'),
(11, 38, 34, 0, '2025-04-19 17:22:29'),
(12, 25, 40, 0, '2025-04-19 20:28:31');

-- --------------------------------------------------------

--
-- Table structure for table `job_titles`
--

CREATE TABLE `job_titles` (
  `id` int NOT NULL,
  `title` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `job_titles`
--

INSERT INTO `job_titles` (`id`, `title`) VALUES
(51, 'Accountant'),
(16, 'AI Engineer'),
(49, 'Architect'),
(63, 'Artist'),
(3, 'Backend Developer'),
(12, 'Business Analyst'),
(35, 'Business Development Executive'),
(52, 'Chartered Accountant'),
(46, 'Civil Engineer'),
(17, 'Cloud Engineer'),
(62, 'Coach'),
(56, 'Consultant'),
(28, 'Content Writer'),
(36, 'Customer Support Executive'),
(22, 'Cybersecurity Specialist'),
(13, 'Data Analyst'),
(14, 'Data Scientist'),
(19, 'Database Administrator'),
(18, 'DevOps Engineer'),
(30, 'Digital Marketer'),
(43, 'Doctor'),
(48, 'Electrical Engineer'),
(57, 'Entrepreneur'),
(53, 'Financial Analyst'),
(58, 'Freelancer'),
(2, 'Frontend Developer'),
(4, 'Full Stack Developer'),
(27, 'Game Designer'),
(26, 'Game Developer'),
(7, 'Graphic Designer'),
(37, 'HR Executive'),
(38, 'HR Manager'),
(50, 'Interior Designer'),
(59, 'Intern'),
(21, 'IT Support Specialist'),
(54, 'Lawyer'),
(55, 'Legal Advisor'),
(15, 'Machine Learning Engineer'),
(33, 'Marketing Manager'),
(47, 'Mechanical Engineer'),
(5, 'Mobile App Developer'),
(64, 'Musician'),
(20, 'Network Engineer'),
(44, 'Nurse'),
(67, 'Other'),
(45, 'Pharmacist'),
(65, 'Photographer'),
(8, 'Product Designer'),
(11, 'Product Manager'),
(41, 'Professor'),
(10, 'Project Manager'),
(24, 'Quality Assurance Engineer'),
(39, 'Recruiter'),
(42, 'Researcher'),
(34, 'Sales Executive'),
(31, 'SEO Specialist'),
(32, 'Social Media Manager'),
(1, 'Software Developer'),
(60, 'Student'),
(23, 'System Administrator'),
(40, 'Teacher'),
(29, 'Technical Writer'),
(25, 'Test Engineer'),
(61, 'Trainer'),
(6, 'UI/UX Designer'),
(66, 'Videographer'),
(9, 'Web Designer');

-- --------------------------------------------------------

--
-- Table structure for table `languages`
--

CREATE TABLE `languages` (
  `id` int NOT NULL,
  `title` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `languages`
--

INSERT INTO `languages` (`id`, `title`, `created_at`) VALUES
(1, 'Hindi', '2024-09-20 07:36:07'),
(2, 'English', '2024-09-20 07:36:07'),
(3, 'Telugu', '2024-09-20 07:36:07'),
(4, 'Marathi', '2024-09-20 07:36:07'),
(5, 'Tamil', '2024-09-20 07:36:07'),
(6, 'Gujarati', '2024-09-20 07:36:07'),
(7, 'Urdu', '2024-09-20 07:36:07'),
(8, 'Kannada', '2024-09-20 07:36:07'),
(9, 'Odia', '2024-09-20 07:36:07'),
(10, 'Malayalam', '2024-09-20 07:36:07');

-- --------------------------------------------------------

--
-- Table structure for table `mbti_ai_compatibility`
--

CREATE TABLE `mbti_ai_compatibility` (
  `id` int NOT NULL,
  `user_mbti_type` varchar(4) NOT NULL,
  `ai_mbti_type` varchar(4) NOT NULL,
  `compatibility_score` int NOT NULL,
  `relationship_type` enum('ideal','complementary','challenging','similar') NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mbti_compatibility`
--

CREATE TABLE `mbti_compatibility` (
  `id` int NOT NULL,
  `mbti_type` varchar(4) NOT NULL,
  `compatible_type` varchar(4) NOT NULL,
  `tier` enum('great','good','average','not_ideal','bad') NOT NULL,
  `match_order` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `mbti_compatibility`
--

INSERT INTO `mbti_compatibility` (`id`, `mbti_type`, `compatible_type`, `tier`, `match_order`) VALUES
(1, 'ENTP', 'INFJ', 'great', 1),
(2, 'ENTP', 'INFP', 'great', 2),
(3, 'ENTP', 'ENFP', 'good', 3),
(4, 'ENTP', 'ENTP', 'good', 4),
(5, 'ENTP', 'ENFJ', 'good', 5),
(6, 'ENTP', 'INTJ', 'average', 6),
(7, 'ENTP', 'ISFP', 'average', 7),
(8, 'ENTP', 'INTP', 'average', 8),
(9, 'ENTP', 'ESFP', 'not_ideal', 9),
(10, 'ENTP', 'ISTP', 'not_ideal', 10),
(11, 'ENTP', 'ENTJ', 'not_ideal', 11),
(12, 'ENTP', 'ISFJ', 'not_ideal', 12),
(13, 'ENTP', 'ESTP', 'bad', 13),
(14, 'ENTP', 'ESFJ', 'bad', 14),
(15, 'ENTP', 'ISTJ', 'bad', 15),
(16, 'ENTP', 'ESTJ', 'bad', 16),
(17, 'INTP', 'ENFP', 'great', 1),
(18, 'INTP', 'ENTJ', 'great', 2),
(19, 'INTP', 'INFJ', 'good', 3),
(20, 'INTP', 'INTP', 'good', 4),
(21, 'INTP', 'ENTP', 'good', 5),
(22, 'INTP', 'INTJ', 'average', 6),
(23, 'INTP', 'INFP', 'average', 7),
(24, 'INTP', 'ISFP', 'average', 8),
(25, 'INTP', 'ISTP', 'not_ideal', 9),
(26, 'INTP', 'ENFJ', 'not_ideal', 10),
(27, 'INTP', 'ESFP', 'not_ideal', 11),
(28, 'INTP', 'ISFJ', 'not_ideal', 12),
(29, 'INTP', 'ESTP', 'bad', 13),
(30, 'INTP', 'ESFJ', 'bad', 14),
(31, 'INTP', 'ISTJ', 'bad', 15),
(32, 'INTP', 'ESTJ', 'bad', 16),
(33, 'INTJ', 'ENFP', 'great', 1),
(34, 'INTJ', 'ENTP', 'great', 2),
(35, 'INTJ', 'INFJ', 'good', 3),
(36, 'INTJ', 'INTJ', 'good', 4),
(37, 'INTJ', 'INTP', 'good', 5),
(38, 'INTJ', 'ENTJ', 'average', 6),
(39, 'INTJ', 'INFP', 'average', 7),
(40, 'INTJ', 'ISTP', 'average', 8),
(41, 'INTJ', 'ISFP', 'not_ideal', 9),
(42, 'INTJ', 'ENFJ', 'not_ideal', 10),
(43, 'INTJ', 'ESTP', 'not_ideal', 11),
(44, 'INTJ', 'ISFJ', 'not_ideal', 12),
(45, 'INTJ', 'ESFP', 'bad', 13),
(46, 'INTJ', 'ISTJ', 'bad', 14),
(47, 'INTJ', 'ESFJ', 'bad', 15),
(48, 'INTJ', 'ESTJ', 'bad', 16),
(49, 'INFJ', 'ENTP', 'great', 1),
(50, 'INFJ', 'ENFP', 'great', 2),
(51, 'INFJ', 'INFJ', 'good', 3),
(52, 'INFJ', 'INFP', 'good', 4),
(53, 'INFJ', 'INTJ', 'good', 5),
(54, 'INFJ', 'INTP', 'average', 6),
(55, 'INFJ', 'ENFJ', 'average', 7),
(56, 'INFJ', 'ISFP', 'average', 8),
(57, 'INFJ', 'ENTJ', 'not_ideal', 9),
(58, 'INFJ', 'ISTP', 'not_ideal', 10),
(59, 'INFJ', 'ESFP', 'not_ideal', 11),
(60, 'INFJ', 'ISFJ', 'not_ideal', 12),
(61, 'INFJ', 'ESTP', 'bad', 13),
(62, 'INFJ', 'ESFJ', 'bad', 14),
(63, 'INFJ', 'ISTJ', 'bad', 15),
(64, 'INFJ', 'ESTJ', 'bad', 16),
(65, 'INFP', 'ENFJ', 'great', 1),
(66, 'INFP', 'ENFP', 'great', 2),
(67, 'INFP', 'INFJ', 'good', 3),
(68, 'INFP', 'INFP', 'good', 4),
(69, 'INFP', 'ENTP', 'good', 5),
(70, 'INFP', 'ISFP', 'average', 6),
(71, 'INFP', 'INTJ', 'average', 7),
(72, 'INFP', 'INTP', 'average', 8),
(73, 'INFP', 'ESFP', 'not_ideal', 9),
(74, 'INFP', 'ENTJ', 'not_ideal', 10),
(75, 'INFP', 'ISTP', 'not_ideal', 11),
(76, 'INFP', 'ISFJ', 'not_ideal', 12),
(77, 'INFP', 'ESTP', 'bad', 13),
(78, 'INFP', 'ESFJ', 'bad', 14),
(79, 'INFP', 'ISTJ', 'bad', 15),
(80, 'INFP', 'ESTJ', 'bad', 16),
(81, 'ENFP', 'INFJ', 'great', 1),
(82, 'ENFP', 'INTJ', 'great', 2),
(83, 'ENFP', 'INFP', 'good', 3),
(84, 'ENFP', 'ENFP', 'good', 4),
(85, 'ENFP', 'INTP', 'good', 5),
(86, 'ENFP', 'ENTP', 'good', 6),
(87, 'ENFP', 'ISFP', 'average', 7),
(88, 'ENFP', 'ENFJ', 'average', 8),
(89, 'ENFP', 'ENTJ', 'average', 9),
(90, 'ENFP', 'ISTP', 'not_ideal', 10),
(91, 'ENFP', 'ESFP', 'not_ideal', 11),
(92, 'ENFP', 'ISFJ', 'not_ideal', 12),
(93, 'ENFP', 'ESTP', 'bad', 13),
(94, 'ENFP', 'ESFJ', 'bad', 14),
(95, 'ENFP', 'ISTJ', 'bad', 15),
(96, 'ENFP', 'ESTJ', 'bad', 16),
(97, 'ENTJ', 'INTP', 'great', 1),
(98, 'ENTJ', 'INFP', 'great', 2),
(99, 'ENTJ', 'INTJ', 'good', 3),
(100, 'ENTJ', 'ENTP', 'good', 4),
(101, 'ENTJ', 'ENTJ', 'good', 5),
(102, 'ENTJ', 'INFJ', 'average', 6),
(103, 'ENTJ', 'ENFP', 'average', 7),
(104, 'ENTJ', 'ENFJ', 'average', 8),
(105, 'ENTJ', 'ISFP', 'not_ideal', 9),
(106, 'ENTJ', 'ISTP', 'not_ideal', 10),
(107, 'ENTJ', 'ESFP', 'not_ideal', 11),
(108, 'ENTJ', 'ISFJ', 'not_ideal', 12),
(109, 'ENTJ', 'ESTP', 'bad', 13),
(110, 'ENTJ', 'ESFJ', 'bad', 14),
(111, 'ENTJ', 'ISTJ', 'bad', 15),
(112, 'ENTJ', 'ESTJ', 'bad', 16),
(113, 'ENFJ', 'INFP', 'great', 1),
(114, 'ENFJ', 'ISFP', 'great', 2),
(115, 'ENFJ', 'INFJ', 'good', 3),
(116, 'ENFJ', 'ENFP', 'good', 4),
(117, 'ENFJ', 'ENFJ', 'good', 5),
(118, 'ENFJ', 'INTP', 'average', 6),
(119, 'ENFJ', 'ENTP', 'average', 7),
(120, 'ENFJ', 'ESFP', 'average', 8),
(121, 'ENFJ', 'INTJ', 'not_ideal', 9),
(122, 'ENFJ', 'ISFJ', 'not_ideal', 10),
(123, 'ENFJ', 'ISTP', 'not_ideal', 11),
(124, 'ENFJ', 'ENTJ', 'not_ideal', 12),
(125, 'ENFJ', 'ESFJ', 'bad', 13),
(126, 'ENFJ', 'ESTP', 'bad', 14),
(127, 'ENFJ', 'ISTJ', 'bad', 15),
(128, 'ENFJ', 'ESTJ', 'bad', 16),
(129, 'ISFJ', 'ESFP', 'great', 1),
(130, 'ISFJ', 'ESTP', 'great', 2),
(131, 'ISFJ', 'ISFJ', 'good', 3),
(132, 'ISFJ', 'ISFP', 'good', 4),
(133, 'ISFJ', 'ENFJ', 'good', 5),
(134, 'ISFJ', 'INFP', 'average', 6),
(135, 'ISFJ', 'INFJ', 'average', 7),
(136, 'ISFJ', 'ESFJ', 'average', 8),
(137, 'ISFJ', 'ENFP', 'not_ideal', 9),
(138, 'ISFJ', 'ISTP', 'not_ideal', 10),
(139, 'ISFJ', 'ISTJ', 'not_ideal', 11),
(140, 'ISFJ', 'ENTP', 'not_ideal', 12),
(141, 'ISFJ', 'ENTJ', 'bad', 13),
(142, 'ISFJ', 'INTP', 'bad', 14),
(143, 'ISFJ', 'INTJ', 'bad', 15),
(144, 'ISFJ', 'ESTJ', 'bad', 16),
(145, 'ISFP', 'ENFJ', 'great', 1),
(146, 'ISFP', 'ESFJ', 'great', 2),
(147, 'ISFP', 'ISFP', 'good', 3),
(148, 'ISFP', 'INFP', 'good', 4),
(149, 'ISFP', 'INFJ', 'good', 5),
(150, 'ISFP', 'ENFP', 'average', 6),
(151, 'ISFP', 'ESFP', 'average', 7),
(152, 'ISFP', 'ENTP', 'average', 8),
(153, 'ISFP', 'ISFJ', 'not_ideal', 9),
(154, 'ISFP', 'ISTP', 'not_ideal', 10),
(155, 'ISFP', 'INTP', 'not_ideal', 11),
(156, 'ISFP', 'INTJ', 'not_ideal', 12),
(157, 'ISFP', 'ENTJ', 'bad', 13),
(158, 'ISFP', 'ESTP', 'bad', 14),
(159, 'ISFP', 'ISTJ', 'bad', 15),
(160, 'ISFP', 'ESTJ', 'bad', 16),
(161, 'ISTP', 'ESFJ', 'great', 1),
(162, 'ISTP', 'ENFJ', 'great', 2),
(163, 'ISTP', 'ISTP', 'good', 3),
(164, 'ISTP', 'ESTP', 'good', 4),
(165, 'ISTP', 'ISFP', 'good', 5),
(166, 'ISTP', 'INFP', 'average', 6),
(167, 'ISTP', 'INFJ', 'average', 7),
(168, 'ISTP', 'ENFP', 'average', 8),
(169, 'ISTP', 'ENTP', 'not_ideal', 9),
(170, 'ISTP', 'ISFJ', 'not_ideal', 10),
(171, 'ISTP', 'INTP', 'not_ideal', 11),
(172, 'ISTP', 'INTJ', 'not_ideal', 12),
(173, 'ISTP', 'ENTJ', 'bad', 13),
(174, 'ISTP', 'ESFP', 'bad', 14),
(175, 'ISTP', 'ISTJ', 'bad', 15),
(176, 'ISTP', 'ESTJ', 'bad', 16),
(177, 'ISTJ', 'ESFJ', 'great', 1),
(178, 'ISTJ', 'ISFJ', 'great', 2),
(179, 'ISTJ', 'ISTJ', 'good', 3),
(180, 'ISTJ', 'ESTJ', 'good', 4),
(181, 'ISTJ', 'ESTP', 'good', 5),
(182, 'ISTJ', 'ISFP', 'average', 6),
(183, 'ISTJ', 'INFP', 'average', 7),
(184, 'ISTJ', 'ENFJ', 'average', 8),
(185, 'ISTJ', 'ENFP', 'not_ideal', 9),
(186, 'ISTJ', 'INFJ', 'not_ideal', 10),
(187, 'ISTJ', 'ENTJ', 'not_ideal', 11),
(188, 'ISTJ', 'INTJ', 'not_ideal', 12),
(189, 'ISTJ', 'INTP', 'bad', 13),
(190, 'ISTJ', 'ENTP', 'bad', 14),
(191, 'ISTJ', 'ESFP', 'bad', 15),
(192, 'ISTJ', 'ISTP', 'bad', 16),
(193, 'ESTP', 'ISFJ', 'great', 1),
(194, 'ESTP', 'ESFJ', 'great', 2),
(195, 'ESTP', 'ESTP', 'good', 3),
(196, 'ESTP', 'ESFP', 'good', 4),
(197, 'ESTP', 'ENFP', 'good', 5),
(198, 'ESTP', 'ENTP', 'good', 6),
(199, 'ESTP', 'INFP', 'average', 7),
(200, 'ESTP', 'ISFP', 'average', 8),
(201, 'ESTP', 'ISTP', 'average', 9),
(202, 'ESTP', 'ENFJ', 'not_ideal', 10),
(203, 'ESTP', 'ENTJ', 'not_ideal', 11),
(204, 'ESTP', 'INFJ', 'not_ideal', 12),
(205, 'ESTP', 'INTJ', 'not_ideal', 13),
(206, 'ESTP', 'INTP', 'bad', 14),
(207, 'ESTP', 'ISTJ', 'bad', 15),
(208, 'ESTP', 'ESTJ', 'bad', 16),
(209, 'ESFP', 'ISFJ', 'great', 1),
(210, 'ESFP', 'ISTJ', 'great', 2),
(211, 'ESFP', 'ESFP', 'good', 3),
(212, 'ESFP', 'ESTP', 'good', 4),
(213, 'ESFP', 'ISFP', 'good', 5),
(214, 'ESFP', 'INFP', 'good', 6),
(215, 'ESFP', 'ENFP', 'good', 7),
(216, 'ESFP', 'ENFJ', 'average', 8),
(217, 'ESFP', 'ESFJ', 'average', 9),
(218, 'ESFP', 'ENTP', 'not_ideal', 10),
(219, 'ESFP', 'INFJ', 'not_ideal', 11),
(220, 'ESFP', 'INTP', 'not_ideal', 12),
(221, 'ESFP', 'INTJ', 'not_ideal', 13),
(222, 'ESFP', 'ENTJ', 'bad', 14),
(223, 'ESFP', 'ISTP', 'bad', 15),
(224, 'ESFP', 'ESTJ', 'bad', 16),
(225, 'ESTJ', 'ISFJ', 'great', 1),
(226, 'ESTJ', 'ISTJ', 'great', 2),
(227, 'ESTJ', 'ESFJ', 'good', 3),
(228, 'ESTJ', 'ESTJ', 'good', 4),
(229, 'ESTJ', 'ESTP', 'good', 5),
(230, 'ESTJ', 'ISTP', 'good', 6),
(231, 'ESTJ', 'ISFP', 'average', 7),
(232, 'ESTJ', 'ESFP', 'average', 8),
(233, 'ESTJ', 'ENFJ', 'not_ideal', 9),
(234, 'ESTJ', 'ENTJ', 'not_ideal', 10),
(235, 'ESTJ', 'ENTP', 'not_ideal', 11),
(236, 'ESTJ', 'INFP', 'not_ideal', 12),
(237, 'ESTJ', 'INFJ', 'bad', 13),
(238, 'ESTJ', 'INTJ', 'bad', 14),
(239, 'ESTJ', 'ENFP', 'bad', 15),
(240, 'ESTJ', 'INTP', 'bad', 16),
(241, 'ESFJ', 'ISFP', 'great', 1),
(242, 'ESFJ', 'ISTP', 'great', 2),
(243, 'ESFJ', 'ESFJ', 'good', 3),
(244, 'ESFJ', 'ISFJ', 'good', 4),
(245, 'ESFJ', 'ESTP', 'good', 5),
(246, 'ESFJ', 'ESFP', 'good', 6),
(247, 'ESFJ', 'ENFJ', 'average', 7),
(248, 'ESFJ', 'INFP', 'average', 8),
(249, 'ESFJ', 'ENFP', 'average', 9),
(250, 'ESFJ', 'INFJ', 'not_ideal', 10),
(251, 'ESFJ', 'INTJ', 'not_ideal', 11),
(252, 'ESFJ', 'ENTJ', 'not_ideal', 12),
(253, 'ESFJ', 'INTP', 'not_ideal', 13),
(254, 'ESFJ', 'ENTP', 'bad', 14),
(255, 'ESFJ', 'ISTJ', 'bad', 15),
(256, 'ESFJ', 'ESTJ', 'bad', 16);

-- --------------------------------------------------------

--
-- Table structure for table `mbti_compatibility_real`
--

CREATE TABLE `mbti_compatibility_real` (
  `user_mbti` varchar(4) DEFAULT NULL,
  `ai_friend_1` varchar(4) DEFAULT NULL,
  `ai_friend_2` varchar(4) DEFAULT NULL,
  `ai_friend_3` varchar(4) DEFAULT NULL,
  `ai_friend_4` varchar(4) DEFAULT NULL,
  `ai_friend_5` varchar(4) DEFAULT NULL,
  `score_1` int DEFAULT NULL,
  `score_2` int DEFAULT NULL,
  `score_3` int DEFAULT NULL,
  `score_4` int DEFAULT NULL,
  `score_5` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `mbti_compatibility_real`
--

INSERT INTO `mbti_compatibility_real` (`user_mbti`, `ai_friend_1`, `ai_friend_2`, `ai_friend_3`, `ai_friend_4`, `ai_friend_5`, `score_1`, `score_2`, `score_3`, `score_4`, `score_5`) VALUES
('INTJ', 'ENFP', 'ENTP', 'INFJ', 'INFP', 'ENTJ', 85, 80, 78, 75, 72),
('INTP', 'ENFJ', 'ENTJ', 'INFJ', 'ENFP', 'ESTJ', 82, 79, 76, 74, 71),
('ENTJ', 'INFP', 'INTP', 'ENFP', 'INTJ', 'ENTP', 83, 81, 78, 76, 73),
('ENTP', 'INFJ', 'INTJ', 'ENFJ', 'ISFJ', 'INFP', 84, 82, 79, 77, 74),
('INFJ', 'ENTP', 'ENFP', 'INTJ', 'INFP', 'ENFJ', 86, 84, 81, 79, 76),
('INFP', 'ENFJ', 'ENTJ', 'INTJ', 'ENFP', 'INFJ', 87, 85, 82, 80, 77),
('ENFJ', 'INFP', 'INTP', 'ISFP', 'ENFP', 'INFJ', 88, 86, 83, 81, 78),
('ENFP', 'INTJ', 'INFJ', 'ENTJ', 'INFP', 'ENFJ', 89, 87, 84, 82, 79),
('ISTJ', 'ESTP', 'ESFP', 'ESTJ', 'ISFJ', 'ESFJ', 75, 73, 70, 68, 65),
('ISFJ', 'ESTP', 'ESFP', 'ENTP', 'ESTJ', 'ISTJ', 76, 74, 71, 69, 66),
('ESTJ', 'ISTP', 'INTP', 'ISFP', 'ISTJ', 'ESFJ', 77, 75, 72, 70, 67),
('ESFJ', 'ISTP', 'ISFP', 'ISTJ', 'ESTJ', 'ISFJ', 78, 76, 73, 71, 68),
('ISTP', 'ESTJ', 'ESFJ', 'ESTP', 'ISFP', 'ESFP', 72, 70, 67, 65, 62),
('ISFP', 'ENFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ESFP', 73, 71, 68, 66, 63),
('ESTP', 'ISFJ', 'ISTJ', 'ISTP', 'ESFP', 'ISFP', 74, 72, 69, 67, 64),
('ESFP', 'ISFJ', 'ISTJ', 'ISTP', 'ESTP', 'ISFP', 75, 73, 70, 68, 65);

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `conversation_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_edited` tinyint(1) DEFAULT '0',
  `is_deleted` tinyint(1) DEFAULT '0',
  `reply_to_id` int DEFAULT NULL,
  `message_type` enum('text','image','file','audio','video','system') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'text'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `content`, `created_at`, `updated_at`, `is_edited`, `is_deleted`, `reply_to_id`, `message_type`) VALUES
(1, 1, 25, 'hi', '2025-04-20 20:49:43', '2025-04-20 20:49:43', 0, 0, NULL, 'text'),
(2, 1, 25, 'hello world', '2025-04-20 20:52:26', '2025-04-20 20:52:26', 0, 0, NULL, 'text'),
(3, 1, 25, '🥺hi', '2025-04-20 20:52:33', '2025-04-20 20:52:33', 0, 0, NULL, 'text'),
(4, 1, 25, '🖱️', '2025-04-20 20:59:12', '2025-04-20 20:59:12', 0, 0, NULL, 'text'),
(5, 1, 40, 'hello', '2025-04-20 21:00:02', '2025-04-20 21:00:02', 0, 0, NULL, 'text'),
(6, 1, 40, 'Hello world', '2025-04-20 21:00:23', '2025-04-20 21:00:23', 0, 0, NULL, 'text'),
(7, 1, 25, 'fine', '2025-04-20 21:00:39', '2025-04-20 21:00:39', 0, 0, NULL, 'text'),
(8, 1, 25, 'Testing chat functions 🌀', '2025-04-20 21:02:49', '2025-04-20 21:02:49', 0, 0, NULL, 'text'),
(9, 1, 40, 'yeah I know', '2025-04-20 21:03:08', '2025-04-20 21:03:08', 0, 0, NULL, 'text'),
(10, 1, 25, 'how are you?', '2025-04-20 21:07:25', '2025-04-20 21:07:25', 0, 0, NULL, 'text'),
(11, 1, 40, 'All is well?', '2025-04-20 21:07:43', '2025-04-20 21:07:43', 0, 0, NULL, 'text'),
(12, 1, 40, 'THank you', '2025-04-20 21:08:41', '2025-04-20 21:08:41', 0, 0, NULL, 'text'),
(13, 1, 25, 'heyyy', '2025-04-20 21:08:58', '2025-04-20 21:08:58', 0, 0, NULL, 'text'),
(14, 1, 40, 'getting images?', '2025-04-20 21:09:10', '2025-04-20 21:09:10', 0, 0, NULL, 'text'),
(15, 1, 25, '🎶', '2025-04-20 21:09:16', '2025-04-20 21:09:16', 0, 0, NULL, 'text'),
(16, 1, 40, '🎁', '2025-04-20 21:09:20', '2025-04-20 21:09:20', 0, 0, NULL, 'text');

-- --------------------------------------------------------

--
-- Table structure for table `message_attachments`
--

CREATE TABLE `message_attachments` (
  `id` int NOT NULL,
  `message_id` int NOT NULL,
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `duration` float DEFAULT NULL,
  `thumbnail_path` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message_reactions`
--

CREATE TABLE `message_reactions` (
  `id` int NOT NULL,
  `message_id` int NOT NULL,
  `user_id` int NOT NULL,
  `reaction` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `message_reads`
--

CREATE TABLE `message_reads` (
  `id` int NOT NULL,
  `message_id` int NOT NULL,
  `user_id` int NOT NULL,
  `read_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `message_reads`
--

INSERT INTO `message_reads` (`id`, `message_id`, `user_id`, `read_at`) VALUES
(1, 1, 40, '2025-04-20 20:59:58'),
(2, 2, 40, '2025-04-20 20:59:58'),
(3, 3, 40, '2025-04-20 20:59:58'),
(4, 4, 40, '2025-04-20 20:59:58'),
(5, 5, 25, '2025-04-20 21:00:08');

-- --------------------------------------------------------

--
-- Table structure for table `options`
--

CREATE TABLE `options` (
  `id` int NOT NULL,
  `option_text` varchar(300) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `analytic_id` int NOT NULL,
  `question_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `options`
--

INSERT INTO `options` (`id`, `option_text`, `analytic_id`, `question_id`) VALUES
(1, 'Feel energized by interacting with many people.', 1, 1),
(2, 'Feel drained after socializing for a long time.', 2, 1),
(3, 'Engaging in activities with friends and family.', 1, 2),
(4, 'Spending time alone or with a close friend.', 2, 2),
(5, 'Think out loud and discuss ideas with others.', 1, 3),
(6, 'Process thoughts internally before sharing.', 2, 3),
(7, 'Focusing on the details and facts.', 3, 4),
(8, 'Understanding the underlying concepts and theories.', 4, 4),
(9, 'Focus on what is happening now and what is realistic.', 3, 5),
(10, 'Think about future possibilities and what could be.', 4, 5),
(11, 'Rely on past experiences and practical solutions.', 3, 6),
(12, 'Look for new ideas and innovative solutions.', 4, 6),
(13, 'Logical analysis and objective criteria.', 5, 7),
(14, 'Personal values and the impact on others.', 6, 7),
(15, 'Firm and fair in your judgments.', 5, 8),
(16, 'Compassionate and considerate of people\'s feelings.', 6, 8),
(17, 'Focus on resolving the issue logically.', 5, 9),
(18, 'Aim to maintain harmony and avoid hurting others.', 6, 9),
(19, 'Having a clear plan and sticking to it.', 7, 10),
(20, 'Being spontaneous and flexible with your plans.', 8, 10),
(21, 'Prefer to complete tasks ahead of time.', 7, 11),
(22, 'Feel comfortable working close to the deadline.', 8, 11),
(23, 'Like to have things decided and settled.', 7, 12),
(24, 'Enjoy keeping options open and exploring new opportunities.', 8, 12);

-- --------------------------------------------------------

--
-- Table structure for table `payment_webhooks`
--

CREATE TABLE `payment_webhooks` (
  `id` int NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `razorpay_signature` text,
  `webhook_payload` json NOT NULL,
  `status` enum('received','processed','failed') DEFAULT 'received',
  `processed_at` timestamp NULL DEFAULT NULL,
  `error_message` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Logs all Razorpay webhook events for audit and processing';

-- --------------------------------------------------------

--
-- Table structure for table `people_pair`
--

CREATE TABLE `people_pair` (
  `id` int NOT NULL,
  `pair1` varchar(4) NOT NULL,
  `pair2` varchar(4) NOT NULL,
  `description` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `people_pair`
--

INSERT INTO `people_pair` (`id`, `pair1`, `pair2`, `description`) VALUES
(1, 'INTP', 'INTJ', 'INTP and INTJ pairing description'),
(2, 'INTP', 'INFP', 'INTP and INFP pairing description'),
(3, 'INTP', 'INFJ', 'INTP and INFJ pairing description'),
(4, 'INTP', 'ISTP', 'INTP and ISTP pairing description'),
(5, 'INTP', 'ISTJ', 'INTP and ISTJ pairing description'),
(6, 'INTP', 'ISFP', 'INTP and ISFP pairing description'),
(7, 'INTP', 'ISFJ', 'INTP and ISFJ pairing description'),
(8, 'INTP', 'ENTP', 'INTP and ENTP pairing description'),
(9, 'INTP', 'ENTJ', 'INTP and ENTJ pairing description'),
(10, 'INTP', 'ENFP', 'INTP and ENFP pairing description'),
(11, 'INTP', 'ENFJ', 'INTP and ENFJ pairing description'),
(12, 'INTP', 'ESTP', 'INTP and ESTP pairing description'),
(13, 'INTP', 'ESTJ', 'INTP and ESTJ pairing description'),
(14, 'INTP', 'ESFP', 'INTP and ESFP pairing description'),
(15, 'INTP', 'ESFJ', 'INTP and ESFJ pairing description'),
(16, 'INTJ', 'INFP', 'INTJ and INFP pairing description'),
(17, 'INTJ', 'INFJ', 'INTJ and INFJ pairing description'),
(18, 'INTJ', 'ISTP', 'INTJ and ISTP pairing description'),
(19, 'INTJ', 'ISTJ', 'INTJ and ISTJ pairing description'),
(20, 'INTJ', 'ISFP', 'INTJ and ISFP pairing description'),
(21, 'INTJ', 'ISFJ', 'INTJ and ISFJ pairing description'),
(22, 'INTJ', 'ENTP', 'INTJ and ENTP pairing description'),
(23, 'INTJ', 'ENTJ', 'INTJ and ENTJ pairing description'),
(24, 'INTJ', 'ENFP', 'INTJ and ENFP pairing description'),
(25, 'INTJ', 'ENFJ', 'INTJ and ENFJ pairing description'),
(26, 'INTJ', 'ESTP', 'INTJ and ESTP pairing description'),
(27, 'INTJ', 'ESTJ', 'INTJ and ESTJ pairing description'),
(28, 'INTJ', 'ESFP', 'INTJ and ESFP pairing description'),
(29, 'INTJ', 'ESFJ', 'INTJ and ESFJ pairing description'),
(30, 'INFP', 'INFJ', 'INFP and INFJ pairing description'),
(31, 'INFP', 'ISTP', 'INFP and ISTP pairing description'),
(32, 'INFP', 'ISTJ', 'INFP and ISTJ pairing description'),
(33, 'INFP', 'ISFP', 'INFP and ISFP pairing description'),
(34, 'INFP', 'ISFJ', 'INFP and ISFJ pairing description'),
(35, 'INFP', 'ENTP', 'INFP and ENTP pairing description'),
(36, 'INFP', 'ENTJ', 'INFP and ENTJ pairing description'),
(37, 'INFP', 'ENFP', 'INFP and ENFP pairing description'),
(38, 'INFP', 'ENFJ', 'INFP and ENFJ pairing description'),
(39, 'INFP', 'ESTP', 'INFP and ESTP pairing description'),
(40, 'INFP', 'ESTJ', 'INFP and ESTJ pairing description'),
(41, 'INFP', 'ESFP', 'INFP and ESFP pairing description'),
(42, 'INFP', 'ESFJ', 'INFP and ESFJ pairing description'),
(43, 'INFJ', 'ISTP', 'INFJ and ISTP pairing description'),
(44, 'INFJ', 'ISTJ', 'INFJ and ISTJ pairing description'),
(45, 'INFJ', 'ISFP', 'INFJ and ISFP pairing description'),
(46, 'INFJ', 'ISFJ', 'INFJ and ISFJ pairing description'),
(47, 'INFJ', 'ENTP', 'INFJ and ENTP pairing description'),
(48, 'INFJ', 'ENTJ', 'INFJ and ENTJ pairing description'),
(49, 'INFJ', 'ENFP', 'INFJ and ENFP pairing description'),
(50, 'INFJ', 'ENFJ', 'INFJ and ENFJ pairing description'),
(51, 'INFJ', 'ESTP', 'INFJ and ESTP pairing description'),
(52, 'INFJ', 'ESTJ', 'INFJ and ESTJ pairing description'),
(53, 'INFJ', 'ESFP', 'INFJ and ESFP pairing description'),
(54, 'INFJ', 'ESFJ', 'INFJ and ESFJ pairing description'),
(55, 'ISTP', 'ISTJ', 'ISTP and ISTJ pairing description'),
(56, 'ISTP', 'ISFP', 'ISTP and ISFP pairing description'),
(57, 'ISTP', 'ISFJ', 'ISTP and ISFJ pairing description'),
(58, 'ISTP', 'ENTP', 'ISTP and ENTP pairing description'),
(59, 'ISTP', 'ENTJ', 'ISTP and ENTJ pairing description'),
(60, 'ISTP', 'ENFP', 'ISTP and ENFP pairing description'),
(61, 'ISTP', 'ENFJ', 'ISTP and ENFJ pairing description'),
(62, 'ISTP', 'ESTP', 'ISTP and ESTP pairing description'),
(63, 'ISTP', 'ESTJ', 'ISTP and ESTJ pairing description'),
(64, 'ISTP', 'ESFP', 'ISTP and ESFP pairing description'),
(65, 'ISTP', 'ESFJ', 'ISTP and ESFJ pairing description'),
(66, 'ISTJ', 'ISFP', 'ISTJ and ISFP pairing description'),
(67, 'ISTJ', 'ISFJ', 'ISTJ and ISFJ pairing description'),
(68, 'ISTJ', 'ENTP', 'ISTJ and ENTP pairing description'),
(69, 'ISTJ', 'ENTJ', 'ISTJ and ENTJ pairing description'),
(70, 'ISTJ', 'ENFP', 'ISTJ and ENFP pairing description'),
(71, 'ISTJ', 'ENFJ', 'ISTJ and ENFJ pairing description'),
(72, 'ISTJ', 'ESTP', 'ISTJ and ESTP pairing description'),
(73, 'ISTJ', 'ESTJ', 'ISTJ and ESTJ pairing description'),
(74, 'ISTJ', 'ESFP', 'ISTJ and ESFP pairing description'),
(75, 'ISTJ', 'ESFJ', 'ISTJ and ESFJ pairing description'),
(76, 'ISFP', 'ISFJ', 'ISFP and ISFJ pairing description'),
(77, 'ISFP', 'ENTP', 'ISFP and ENTP pairing description'),
(78, 'ISFP', 'ENTJ', 'ISFP and ENTJ pairing description'),
(79, 'ISFP', 'ENFP', 'ISFP and ENFP pairing description'),
(80, 'ISFP', 'ENFJ', 'ISFP and ENFJ pairing description'),
(81, 'ISFP', 'ESTP', 'ISFP and ESTP pairing description'),
(82, 'ISFP', 'ESTJ', 'ISFP and ESTJ pairing description'),
(83, 'ISFP', 'ESFP', 'ISFP and ESFP pairing description'),
(84, 'ISFP', 'ESFJ', 'ISFP and ESFJ pairing description'),
(85, 'ISFJ', 'ENTP', 'ISFJ and ENTP pairing description'),
(86, 'ISFJ', 'ENTJ', 'ISFJ and ENTJ pairing description'),
(87, 'ISFJ', 'ENFP', 'ISFJ and ENFP pairing description'),
(88, 'ISFJ', 'ENFJ', 'ISFJ and ENFJ pairing description'),
(89, 'ISFJ', 'ESTP', 'ISFJ and ESTP pairing description'),
(90, 'ISFJ', 'ESTJ', 'ISFJ and ESTJ pairing description'),
(91, 'ISFJ', 'ESFP', 'ISFJ and ESFP pairing description'),
(92, 'ISFJ', 'ESFJ', 'ISFJ and ESFJ pairing description'),
(93, 'ENTP', 'ENTJ', 'ENTP and ENTJ pairing description'),
(94, 'ENTP', 'ENFP', 'ENTP and ENFP pairing description'),
(95, 'ENTP', 'ENFJ', 'ENTP and ENFJ pairing description'),
(96, 'ENTP', 'ESTP', 'ENTP and ESTP pairing description'),
(97, 'ENTP', 'ESTJ', 'ENTP and ESTJ pairing description'),
(98, 'ENTP', 'ESFP', 'ENTP and ESFP pairing description'),
(99, 'ENTP', 'ESFJ', 'ENTP and ESFJ pairing description'),
(100, 'ENTJ', 'ENFP', 'ENTJ and ENFP pairing description'),
(101, 'ENTJ', 'ENFJ', 'ENTJ and ENFJ pairing description'),
(102, 'ENTJ', 'ESTP', 'ENTJ and ESTP pairing description'),
(103, 'ENTJ', 'ESTJ', 'ENTJ and ESTJ pairing description'),
(104, 'ENTJ', 'ESFP', 'ENTJ and ESFP pairing description'),
(105, 'ENTJ', 'ESFJ', 'ENTJ and ESFJ pairing description'),
(106, 'ENFP', 'ENFJ', 'ENFP and ENFJ pairing description'),
(107, 'ENFP', 'ESTP', 'ENFP and ESTP pairing description'),
(108, 'ENFP', 'ESTJ', 'ENFP and ESTJ pairing description'),
(109, 'ENFP', 'ESFP', 'ENFP and ESFP pairing description'),
(110, 'ENFP', 'ESFJ', 'ENFP and ESFJ pairing description'),
(111, 'ENFJ', 'ESTP', 'ENFJ and ESTP pairing description'),
(112, 'ENFJ', 'ESTJ', 'ENFJ and ESTJ pairing description'),
(113, 'ENFJ', 'ESFP', 'ENFJ and ESFP pairing description'),
(114, 'ENFJ', 'ESFJ', 'ENFJ and ESFJ pairing description'),
(115, 'ESTP', 'ESTJ', 'ESTP and ESTJ pairing description'),
(116, 'ESTP', 'ESFP', 'ESTP and ESFP pairing description'),
(117, 'ESTP', 'ESFJ', 'ESTP and ESFJ pairing description'),
(118, 'ESTJ', 'ESFP', 'ESTJ and ESFP pairing description'),
(119, 'ESTJ', 'ESFJ', 'ESTJ and ESFJ pairing description'),
(120, 'ESFP', 'ESFJ', 'ESFP and ESFJ pairing description');

-- --------------------------------------------------------

--
-- Table structure for table `preference_categories`
--

CREATE TABLE `preference_categories` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(150) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `allows_any` tinyint(1) DEFAULT '0',
  `allows_multiple` tinyint(1) DEFAULT '0',
  `category_type` enum('single','multiple','range') DEFAULT 'single',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `preference_categories`
--

INSERT INTO `preference_categories` (`id`, `name`, `display_name`, `description`, `is_active`, `allows_any`, `allows_multiple`, `category_type`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'relationship_type', 'Relationship Type', 'What kind of relationship are you looking for?', 1, 0, 0, 'single', 1, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(2, 'age_preference', 'Age Range', 'Preferred age range for matches', 1, 1, 0, 'range', 2, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(3, 'location_distance', 'Distance', 'How far are you willing to travel?', 1, 1, 0, 'single', 3, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(4, 'education_level', 'Education', 'Preferred education level', 1, 1, 0, 'single', 4, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(5, 'smoking_preference', 'Smoking', 'Smoking preferences', 1, 1, 0, 'single', 5, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(6, 'drinking_preference', 'Drinking', 'Drinking preferences', 1, 1, 0, 'single', 6, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(7, 'religion_preference', 'Religion', 'Religious preferences', 1, 1, 0, 'single', 7, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(8, 'diet_preference', 'Diet', 'Dietary preferences', 1, 1, 0, 'single', 8, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(9, 'exercise_frequency', 'Exercise', 'Exercise frequency preferences', 1, 1, 0, 'single', 9, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(10, 'children_preference', 'Children', 'Preferences about having children', 1, 1, 0, 'single', 10, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(11, 'pet_preference', 'Pets', 'Pet preferences', 1, 1, 0, 'single', 11, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(12, 'income_range', 'Income', 'Income preferences', 1, 1, 0, 'range', 12, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(13, 'height_preference', 'Height', 'Height preferences', 1, 1, 0, 'range', 13, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(14, 'interests', 'Interests', 'Select your interests', 1, 0, 1, 'multiple', 14, '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(15, 'languages', 'Languages', 'Languages you speak', 1, 0, 1, 'multiple', 15, '2025-08-09 08:48:24', '2025-08-09 08:48:24');

-- --------------------------------------------------------

--
-- Table structure for table `preference_options`
--

CREATE TABLE `preference_options` (
  `id` int NOT NULL,
  `category_id` int NOT NULL,
  `value` varchar(100) NOT NULL,
  `display_value` varchar(150) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_any_option` tinyint(1) DEFAULT '0',
  `includes_others` tinyint(1) DEFAULT '0',
  `display_order` int DEFAULT '0',
  `option_color` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `preference_options`
--

INSERT INTO `preference_options` (`id`, `category_id`, `value`, `display_value`, `icon`, `is_active`, `is_any_option`, `includes_others`, `display_order`, `option_color`, `created_at`, `updated_at`) VALUES
(1, 1, 'male', 'Man', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(2, 1, 'female', 'Woman', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(3, 1, 'non_binary', 'Non-binary', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(4, 1, 'transgender', 'Transgender', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(5, 1, 'other', 'Other', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(6, 2, 'men', 'Men', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(7, 2, 'women', 'Women', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(8, 2, 'everyone', 'Everyone', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(9, 3, 'non_smoker', 'Don\'t smoke', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(10, 3, 'social_smoker', 'Smoke sometimes', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(11, 3, 'regular_smoker', 'Smoke regularly', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(12, 3, 'trying_to_quit', 'Trying to quit', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(13, 4, 'non_drinker', 'Don\'t drink', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(14, 4, 'social_drinker', 'Drink sometimes', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(15, 4, 'regular_drinker', 'Drink regularly', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(16, 5, 'omnivore', 'Everything', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(17, 5, 'vegetarian', 'Vegetarian', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(18, 5, 'vegan', 'Vegan', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(19, 5, 'pescatarian', 'Pescatarian', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(20, 5, 'keto', 'Keto', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(21, 5, 'paleo', 'Paleo', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(22, 5, 'halal', 'Halal', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(23, 5, 'kosher', 'Kosher', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(24, 6, 'never', 'Never', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(25, 6, 'rarely', 'Rarely', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(26, 6, 'sometimes', 'Sometimes', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(27, 6, 'regularly', 'Regularly', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(28, 6, 'daily', 'Daily', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(29, 7, 'has_children', 'Have children', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(30, 7, 'no_children', 'Don\'t have children', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(31, 7, 'wants_children', 'Want children', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(32, 7, 'does_not_want_children', 'Don\'t want children', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(33, 7, 'open_to_children', 'Open to children', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(34, 8, 'has_dogs', 'Have dogs', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(35, 8, 'has_cats', 'Have cats', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(36, 8, 'has_other_pets', 'Have other pets', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(37, 8, 'no_pets', 'No pets', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(38, 8, 'allergic_to_pets', 'Allergic to pets', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(39, 9, 'casual', 'Something casual', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(40, 9, 'serious', 'Serious relationship', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(41, 9, 'marriage', 'Marriage', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(42, 9, 'not_sure', 'Not sure yet', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(43, 10, 'atheist', 'Atheist', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(44, 10, 'agnostic', 'Agnostic', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(45, 10, 'buddhist', 'Buddhist', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(46, 10, 'christian', 'Christian', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(47, 10, 'hindu', 'Hindu', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(48, 10, 'jewish', 'Jewish', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(49, 10, 'muslim', 'Muslim', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(50, 10, 'sikh', 'Sikh', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(51, 10, 'spiritual', 'Spiritual', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(52, 10, 'other', 'Other', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(53, 11, 'high_school', 'High School', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(54, 11, 'some_college', 'Some College', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(55, 11, 'associate', 'Associate Degree', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(56, 11, 'bachelor', 'Bachelor\'s Degree', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(57, 11, 'master', 'Master\'s Degree', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(58, 11, 'doctorate', 'Doctorate', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(59, 11, 'professional', 'Professional Degree', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(60, 11, 'trade_school', 'Trade School', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(61, 12, 'aries', 'Aries', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(62, 12, 'taurus', 'Taurus', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(63, 12, 'gemini', 'Gemini', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(64, 12, 'cancer', 'Cancer', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(65, 12, 'leo', 'Leo', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(66, 12, 'virgo', 'Virgo', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(67, 12, 'libra', 'Libra', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(68, 12, 'scorpio', 'Scorpio', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(69, 12, 'sagittarius', 'Sagittarius', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(70, 12, 'capricorn', 'Capricorn', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(71, 12, 'aquarius', 'Aquarius', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(72, 12, 'pisces', 'Pisces', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(73, 13, 'alone', 'Live alone', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(74, 13, 'roommates', 'Live with roommates', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(75, 13, 'family', 'Live with family', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(76, 13, 'partner', 'Live with partner', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(77, 13, 'other', 'Other arrangement', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(78, 15, 'athletic', 'Athletic', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(79, 15, 'average', 'Average', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(80, 15, 'slim', 'Slim', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(81, 15, 'muscular', 'Muscular', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(82, 15, 'curvy', 'Curvy', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(83, 15, 'plus_size', 'Plus-size', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(84, 15, 'prefer_not_to_say', 'Prefer not to say', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(85, 16, 'liberal', 'Liberal', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(86, 16, 'moderate', 'Moderate', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(87, 16, 'conservative', 'Conservative', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(88, 16, 'progressive', 'Progressive', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(89, 16, 'apolitical', 'Apolitical', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(90, 16, 'other', 'Other', NULL, 1, 0, 0, 0, NULL, '2025-04-23 11:20:01', '2025-04-23 11:20:01'),
(91, 1, 'serious', 'Serious Relationship', NULL, 1, 0, 0, 1, '#10B981', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(92, 1, 'casual', 'Casual Dating', NULL, 1, 0, 0, 2, '#F59E0B', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(93, 1, 'friendship', 'Friendship First', NULL, 1, 0, 0, 3, '#3B82F6', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(94, 1, 'marriage', 'Looking for Marriage', NULL, 1, 0, 0, 4, '#8B5CF6', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(95, 3, 'any_distance', 'Any Distance', NULL, 1, 1, 1, 1, '#6B7280', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(96, 3, '5km', 'Within 5 km', NULL, 1, 0, 0, 2, '#10B981', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(97, 3, '10km', 'Within 10 km', NULL, 1, 0, 0, 3, '#F59E0B', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(98, 3, '25km', 'Within 25 km', NULL, 1, 0, 0, 4, '#3B82F6', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(99, 3, '50km', 'Within 50 km', NULL, 1, 0, 0, 5, '#8B5CF6', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(100, 3, '100km', 'Within 100 km', NULL, 1, 0, 0, 6, '#EF4444', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(101, 4, 'any_education', 'Any Education Level', NULL, 1, 1, 1, 1, '#6B7280', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(102, 4, 'high_school', 'High School', NULL, 1, 0, 0, 2, '#10B981', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(103, 4, 'bachelors', 'Bachelor\'s Degree', NULL, 1, 0, 0, 3, '#F59E0B', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(104, 4, 'masters', 'Master\'s Degree', NULL, 1, 0, 0, 4, '#3B82F6', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(105, 4, 'phd', 'PhD/Doctorate', NULL, 1, 0, 0, 5, '#8B5CF6', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(106, 5, 'any_smoking', 'Any', NULL, 1, 1, 1, 1, '#6B7280', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(107, 5, 'non_smoker', 'Non-Smoker', NULL, 1, 0, 0, 2, '#10B981', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(108, 5, 'social_smoker', 'Social Smoker', NULL, 1, 0, 0, 3, '#F59E0B', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(109, 5, 'regular_smoker', 'Regular Smoker', NULL, 1, 0, 0, 4, '#EF4444', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(110, 6, 'any_drinking', 'Any', NULL, 1, 1, 1, 1, '#6B7280', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(111, 6, 'non_drinker', 'Non-Drinker', NULL, 1, 0, 0, 2, '#10B981', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(112, 6, 'social_drinker', 'Social Drinker', NULL, 1, 0, 0, 3, '#F59E0B', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(113, 6, 'regular_drinker', 'Regular Drinker', NULL, 1, 0, 0, 4, '#3B82F6', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(114, 7, 'any_religion', 'Any Religion', NULL, 1, 1, 1, 1, '#6B7280', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(115, 7, 'hindu', 'Hindu', NULL, 1, 0, 0, 2, '#FF6B35', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(116, 7, 'muslim', 'Muslim', NULL, 1, 0, 0, 3, '#4ECDC4', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(117, 7, 'christian', 'Christian', NULL, 1, 0, 0, 4, '#45B7D1', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(118, 7, 'sikh', 'Sikh', NULL, 1, 0, 0, 5, '#F9CA24', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(119, 7, 'buddhist', 'Buddhist', NULL, 1, 0, 0, 6, '#6C5CE7', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(120, 7, 'jain', 'Jain', NULL, 1, 0, 0, 7, '#A29BFE', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(121, 7, 'other_religion', 'Other', NULL, 1, 0, 0, 8, '#636E72', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(122, 7, 'no_religion', 'No Religion', NULL, 1, 0, 0, 9, '#2D3436', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(123, 8, 'any_diet', 'Any Diet', NULL, 1, 1, 1, 1, '#6B7280', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(124, 8, 'vegetarian', 'Vegetarian', NULL, 1, 0, 0, 2, '#10B981', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(125, 8, 'vegan', 'Vegan', NULL, 1, 0, 0, 3, '#059669', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(126, 8, 'non_vegetarian', 'Non-Vegetarian', NULL, 1, 0, 0, 4, '#DC2626', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(127, 8, 'jain_food', 'Jain Food', NULL, 1, 0, 0, 5, '#F59E0B', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(128, 9, 'any_exercise', 'Any', NULL, 1, 1, 1, 1, '#6B7280', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(129, 9, 'daily', 'Daily', NULL, 1, 0, 0, 2, '#10B981', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(130, 9, 'few_times_week', 'Few Times a Week', NULL, 1, 0, 0, 3, '#F59E0B', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(131, 9, 'weekly', 'Once a Week', NULL, 1, 0, 0, 4, '#3B82F6', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(132, 9, 'rarely', 'Rarely', NULL, 1, 0, 0, 5, '#EF4444', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(133, 10, 'any_children', 'Any', NULL, 1, 1, 1, 1, '#6B7280', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(134, 10, 'want_children', 'Want Children', NULL, 1, 0, 0, 2, '#10B981', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(135, 10, 'dont_want_children', 'Don\'t Want Children', NULL, 1, 0, 0, 3, '#EF4444', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(136, 10, 'have_children', 'Already Have Children', NULL, 1, 0, 0, 4, '#3B82F6', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(137, 10, 'open_to_children', 'Open to Children', NULL, 1, 0, 0, 5, '#F59E0B', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(138, 11, 'any_pets', 'Any', NULL, 1, 1, 1, 1, '#6B7280', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(139, 11, 'love_pets', 'Love Pets', NULL, 1, 0, 0, 2, '#10B981', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(140, 11, 'no_pets', 'No Pets', NULL, 1, 0, 0, 3, '#EF4444', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(141, 11, 'allergic_to_pets', 'Allergic to Pets', NULL, 1, 0, 0, 4, '#F59E0B', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(142, 14, 'travel', 'Travel', NULL, 1, 0, 0, 1, '#3B82F6', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(143, 14, 'music', 'Music', NULL, 1, 0, 0, 2, '#8B5CF6', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(144, 14, 'movies', 'Movies', NULL, 1, 0, 0, 3, '#EF4444', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(145, 14, 'sports', 'Sports', NULL, 1, 0, 0, 4, '#10B981', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(146, 14, 'reading', 'Reading', NULL, 1, 0, 0, 5, '#F59E0B', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(147, 14, 'cooking', 'Cooking', NULL, 1, 0, 0, 6, '#EC4899', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(148, 14, 'photography', 'Photography', NULL, 1, 0, 0, 7, '#6366F1', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(149, 14, 'dancing', 'Dancing', NULL, 1, 0, 0, 8, '#F97316', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(150, 14, 'art', 'Art', NULL, 1, 0, 0, 9, '#84CC16', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(151, 14, 'technology', 'Technology', NULL, 1, 0, 0, 10, '#06B6D4', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(152, 15, 'hindi', 'Hindi', NULL, 1, 0, 0, 1, '#FF6B35', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(153, 15, 'english', 'English', NULL, 1, 0, 0, 2, '#4ECDC4', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(154, 15, 'tamil', 'Tamil', NULL, 1, 0, 0, 3, '#45B7D1', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(155, 15, 'telugu', 'Telugu', NULL, 1, 0, 0, 4, '#F9CA24', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(156, 15, 'marathi', 'Marathi', NULL, 1, 0, 0, 5, '#6C5CE7', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(157, 15, 'gujarati', 'Gujarati', NULL, 1, 0, 0, 6, '#A29BFE', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(158, 15, 'bengali', 'Bengali', NULL, 1, 0, 0, 7, '#FD79A8', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(159, 15, 'punjabi', 'Punjabi', NULL, 1, 0, 0, 8, '#00B894', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(160, 15, 'kannada', 'Kannada', NULL, 1, 0, 0, 9, '#E17055', '2025-08-09 08:48:24', '2025-08-09 08:48:24'),
(161, 15, 'malayalam', 'Malayalam', NULL, 1, 0, 0, 10, '#81ECEC', '2025-08-09 08:48:24', '2025-08-09 08:48:24');

-- --------------------------------------------------------

--
-- Table structure for table `profile_boosts`
--

CREATE TABLE `profile_boosts` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `boost_type` enum('weekly','monthly') COLLATE utf8mb4_unicode_ci DEFAULT 'weekly',
  `amount` decimal(10,2) NOT NULL,
  `payment_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores profile boost purchases (₹99 weekly add-on)';

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int NOT NULL,
  `question_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `test_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `question_text`, `test_id`) VALUES
(1, 'How important is loyalty in a relationship?', 2),
(2, 'How important is honesty in a relationship?', 2),
(3, 'How do you view the importance of religion or spirituality in a relationship?', 2),
(4, 'How do you feel about sharing responsibilities equally in a relationship?', 2),
(5, 'How do you prefer to handle your finances in a relationship?', 2),
(6, 'How do you feel about having pets in your shared living space?', 2),
(7, 'How important is it for your partner to share your hobbies?', 2),
(8, 'How do you feel about engaging in physical activities with your partner?', 2),
(9, 'What type of vacation do you prefer with your partner?', 2),
(10, 'How often do you enjoy going out socially with your partner?', 2),
(11, 'How important is having a successful career to you?', 2),
(12, 'How do you envision balancing family life and career in the future?', 2),
(13, 'What is your long-term financial goal as a couple?', 2),
(14, 'How do you feel about living in different places throughout life?', 2),
(15, 'How important is it for you to have children?', 2),
(16, 'How do you envision raising children in terms of responsibilities?', 2),
(17, 'How important is extended family involvement in your life?', 2),
(18, 'How do you express love and affection?', 2),
(19, 'How much time do you need alone versus time spent together?', 2),
(20, 'How do you handle emotional challenges in a relationship?', 2),
(21, 'How important is physical intimacy in a relationship?', 2),
(22, 'How do you handle disagreements or conflicts with your partner?', 2),
(23, 'How important is regular communication with your partner?', 2),
(24, 'How important is personal growth and self-improvement for you and your partner?', 2),
(25, 'How do you feel about taking risks and making big life changes with your partner?', 2);

-- --------------------------------------------------------

--
-- Table structure for table `quiz_completion`
--

CREATE TABLE `quiz_completion` (
  `completion_id` int NOT NULL,
  `user_id` int NOT NULL,
  `test_id` int NOT NULL,
  `isStarted` tinyint(1) NOT NULL DEFAULT '0',
  `completed` enum('no','yes') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'no',
  `completion_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_completion`
--

INSERT INTO `quiz_completion` (`completion_id`, `user_id`, `test_id`, `isStarted`, `completed`, `completion_timestamp`) VALUES
(1, 7, 2, 1, 'yes', '2024-09-28 02:21:26'),
(2, 8, 2, 1, 'yes', '2024-09-28 05:57:44'),
(3, 8, 2, 1, 'yes', '2024-09-28 05:57:44'),
(4, 9, 2, 1, 'yes', '2024-09-28 07:42:35'),
(5, 9, 2, 1, 'yes', '2024-09-28 07:42:35'),
(6, 10, 2, 1, 'yes', '2024-09-28 08:58:06'),
(7, 10, 2, 1, 'yes', '2024-09-28 08:58:07'),
(8, 11, 2, 1, 'yes', '2024-09-28 09:21:04'),
(9, 11, 2, 1, 'yes', '2024-09-28 09:21:04'),
(10, 11, 2, 1, 'yes', '2024-09-28 09:21:05'),
(11, 16, 2, 1, 'yes', '2024-09-29 02:14:11'),
(12, 17, 2, 1, 'yes', '2024-09-29 02:21:14'),
(13, 17, 2, 1, 'yes', '2024-09-29 02:21:14'),
(14, 18, 2, 1, 'yes', '2025-04-07 12:00:28'),
(15, 19, 2, 1, 'yes', '2025-04-07 13:44:51'),
(16, 20, 2, 1, 'yes', '2025-04-07 14:20:13'),
(17, 22, 2, 1, 'yes', '2025-04-08 04:51:08'),
(18, 23, 2, 1, 'yes', '2025-04-10 11:33:13'),
(19, 24, 2, 1, 'yes', '2025-04-10 11:37:57'),
(20, 25, 2, 1, 'yes', '2025-04-11 12:32:20'),
(21, 26, 2, 1, 'yes', '2025-04-12 15:27:15'),
(22, 27, 2, 1, 'yes', '2025-04-13 11:25:22'),
(23, 28, 2, 1, 'yes', '2025-04-13 12:00:36'),
(24, 29, 2, 1, 'yes', '2025-04-13 13:57:13'),
(25, 31, 2, 1, 'yes', '2025-04-15 11:36:05'),
(26, 32, 2, 1, 'yes', '2025-04-15 11:51:02'),
(27, 33, 2, 1, 'no', '2025-04-16 06:30:29'),
(28, 34, 2, 1, 'yes', '2025-04-19 05:24:50'),
(29, 35, 2, 1, 'yes', '2025-04-19 10:26:37'),
(30, 36, 2, 1, 'yes', '2025-04-19 13:50:16'),
(31, 37, 2, 1, 'yes', '2025-04-19 17:12:45'),
(32, 39, 2, 1, 'yes', '2025-04-19 18:43:44'),
(33, 40, 2, 1, 'yes', '2025-04-19 19:30:23'),
(34, 41, 2, 1, 'yes', '2025-08-01 06:38:22'),
(35, 44, 2, 1, 'yes', '2025-08-04 13:43:08'),
(36, 45, 2, 1, 'yes', '2025-08-08 05:22:14');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_sequences`
--

CREATE TABLE `quiz_sequences` (
  `id` int NOT NULL,
  `type_sequence` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` int NOT NULL,
  `quiz_id` int NOT NULL,
  `createddate` datetime NOT NULL,
  `isCompleted` tinyint(1) NOT NULL DEFAULT '0',
  `isStarted` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_sequences`
--

INSERT INTO `quiz_sequences` (`id`, `type_sequence`, `user_id`, `quiz_id`, `createddate`, `isCompleted`, `isStarted`) VALUES
(1, 'ESTP', 7, 1, '2024-09-28 01:46:07', 1, 1),
(2, 'INTP', 8, 1, '2024-09-28 05:54:34', 1, 1),
(3, 'INTP', 8, 1, '2024-09-28 05:54:35', 1, 1),
(4, 'INTP', 8, 1, '2024-09-28 05:54:35', 1, 1),
(5, 'INFP', 9, 1, '2024-09-28 07:42:09', 1, 1),
(6, 'INFP', 9, 1, '2024-09-28 07:42:09', 1, 1),
(7, 'INFP', 9, 1, '2024-09-28 07:42:09', 1, 1),
(8, 'ISTJ', 10, 1, '2024-09-28 08:57:39', 1, 1),
(9, 'ISTJ', 10, 1, '2024-09-28 08:57:40', 1, 1),
(10, 'INTP', 11, 1, '2024-09-28 09:20:36', 1, 1),
(11, 'INTP', 11, 1, '2024-09-28 09:20:36', 1, 1),
(12, 'INTP', 11, 1, '2024-09-28 09:20:36', 1, 1),
(13, 'INTP', 11, 1, '2024-09-28 09:20:36', 1, 1),
(14, 'ISFP', 16, 1, '2024-09-29 01:36:18', 1, 1),
(15, 'ISFJ', 17, 1, '2024-09-29 02:20:25', 1, 1),
(16, 'ISFP', 18, 1, '2025-04-07 12:00:02', 1, 1),
(17, 'INTP', 19, 1, '2025-04-07 13:43:52', 1, 1),
(18, 'INTP', 20, 1, '2025-04-07 14:18:30', 1, 1),
(19, 'ISTP', 22, 1, '2025-04-08 04:50:48', 1, 1),
(20, 'INFJ', 23, 1, '2025-04-10 11:32:55', 1, 1),
(21, 'INFJ', 24, 1, '2025-04-10 11:37:31', 1, 1),
(22, 'ENFP', 25, 1, '2025-04-11 12:31:25', 1, 1),
(23, 'ESTJ', 26, 1, '2025-04-12 15:15:49', 1, 1),
(24, 'ESTJ', 26, 1, '2025-04-12 15:15:49', 1, 1),
(25, 'ENFJ', 27, 1, '2025-04-13 11:24:58', 1, 1),
(26, 'ISTP', 28, 1, '2025-04-13 12:00:14', 1, 1),
(27, 'ISTJ', 29, 1, '2025-04-13 13:55:26', 1, 1),
(28, '', 30, 1, '2025-04-13 16:55:08', 0, 1),
(29, 'ISTJ', 31, 1, '2025-04-15 11:35:01', 1, 1),
(30, 'ISFJ', 32, 1, '2025-04-15 11:50:38', 1, 1),
(31, 'ESFJ', 33, 1, '2025-04-16 06:29:54', 1, 1),
(32, 'ISTJ', 34, 1, '2025-04-19 05:23:52', 1, 1),
(33, 'ENTP', 35, 1, '2025-04-19 10:25:31', 1, 1),
(34, 'ISFJ', 36, 1, '2025-04-19 13:49:39', 1, 1),
(35, 'ESTP', 37, 1, '2025-04-19 17:12:12', 1, 1),
(36, 'ISFP', 39, 1, '2025-04-19 18:43:25', 1, 1),
(37, 'ESFJ', 40, 1, '2025-04-19 19:23:22', 1, 1),
(38, 'ISTJ', 41, 1, '2025-08-01 06:36:38', 1, 1),
(39, 'ISFJ', 43, 1, '2025-08-04 13:08:38', 1, 1),
(40, 'ENFP', 44, 1, '2025-08-04 13:15:02', 1, 1),
(41, 'ENFP', 44, 1, '2025-08-04 13:15:03', 1, 1),
(42, 'ENFP', 44, 1, '2025-08-04 13:15:03', 1, 1),
(43, 'ISFJ', 45, 1, '2025-08-08 05:20:56', 1, 1),
(44, 'INTP', 48, 1, '2025-08-09 01:28:22', 1, 1),
(45, 'ISTP', 47, 1, '2025-08-11 05:13:56', 1, 1),
(46, 'ENTP', 49, 1, '2025-08-23 04:54:28', 1, 1),
(47, 'ISFP', 46, 1, '2025-08-23 13:55:26', 1, 1),
(48, 'ISFP', 46, 1, '2025-08-23 13:55:27', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `razorpay_orders`
--

CREATE TABLE `razorpay_orders` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `razorpay_order_id` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'INR',
  `status` enum('created','attempted','paid','failed') DEFAULT 'created',
  `billing_cycle` enum('monthly','quarterly','annual') DEFAULT 'quarterly',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores Razorpay order details for tracking payments';

-- --------------------------------------------------------

--
-- Table structure for table `subscription_payments`
--

CREATE TABLE `subscription_payments` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `subscription_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','completed','failed','refunded') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `razorpay_payment_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `razorpay_order_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `failure_reason` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Stores all payment transactions for subscriptions via Razorpay';

--
-- Dumping data for table `subscription_payments`
--

INSERT INTO `subscription_payments` (`id`, `user_id`, `subscription_id`, `amount`, `currency`, `payment_method`, `payment_id`, `status`, `paid_at`, `created_at`, `updated_at`, `razorpay_payment_id`, `razorpay_order_id`, `failure_reason`) VALUES
(3, 46, 20, 999.00, 'INR', 'razorpay', 'pay_R8o0aEJhcjXntE', 'completed', '2025-08-23 14:16:27', '2025-08-23 14:16:27', '2025-08-23 14:16:27', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` int NOT NULL,
  `plan_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT 'INR',
  `billing_period` enum('monthly','quarterly','annual') COLLATE utf8mb4_unicode_ci NOT NULL,
  `features` json NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `features_json` json DEFAULT NULL,
  `max_connections_per_day` int DEFAULT '-1',
  `ai_chat_enabled` tinyint(1) DEFAULT '0',
  `profile_verification` tinyint(1) DEFAULT '0',
  `priority_support` tinyint(1) DEFAULT '0',
  `weekly_boosts` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `plan_name`, `display_name`, `price`, `currency`, `billing_period`, `features`, `is_active`, `created_at`, `features_json`, `max_connections_per_day`, `ai_chat_enabled`, `profile_verification`, `priority_support`, `weekly_boosts`) VALUES
(1, 'free', 'Free Plan', 0.00, 'INR', 'monthly', '{\"ai_chat\": false, \"basic_chat\": true, \"group_chat\": false, \"profile_boosts\": 0, \"advanced_filtering\": false, \"connections_per_day\": 5, \"profile_verification\": false}', 1, '2025-08-08 20:14:07', NULL, -1, 0, 0, 0, 0),
(2, 'pro', 'Pro Plan', 999.00, 'INR', 'quarterly', '{\"ai_chat\": true, \"basic_chat\": true, \"group_chat\": true, \"profile_boosts\": 0, \"priority_support\": true, \"advanced_filtering\": true, \"connections_per_day\": -1, \"profile_verification\": false}', 1, '2025-08-08 20:14:07', NULL, -1, 0, 0, 0, 0),
(3, 'elite', 'Elite Plan', 1499.00, 'INR', 'quarterly', '{\"ai_chat\": true, \"basic_chat\": true, \"group_chat\": true, \"vip_support\": true, \"profile_boosts\": 50, \"top_tier_badge\": true, \"priority_matching\": true, \"advanced_analytics\": true, \"advanced_filtering\": true, \"connections_per_day\": -1, \"profile_verification\": true}', 1, '2025-08-08 20:14:07', NULL, -1, 0, 0, 0, 0),
(4, 'pro', 'Pro Plan Annual', 799.00, 'INR', 'annual', '{\"ai_chat\": true, \"basic_chat\": true, \"group_chat\": true, \"profile_boosts\": 0, \"priority_support\": true, \"advanced_filtering\": true, \"connections_per_day\": -1, \"profile_verification\": false}', 1, '2025-08-08 20:14:07', NULL, -1, 0, 0, 0, 0),
(5, 'elite', 'Elite Plan Annual', 1199.00, 'INR', 'annual', '{\"ai_chat\": true, \"basic_chat\": true, \"group_chat\": true, \"vip_support\": true, \"profile_boosts\": 50, \"top_tier_badge\": true, \"priority_matching\": true, \"advanced_analytics\": true, \"advanced_filtering\": true, \"connections_per_day\": -1, \"profile_verification\": true}', 1, '2025-08-08 20:14:07', NULL, -1, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `tests`
--

CREATE TABLE `tests` (
  `test_id` int NOT NULL,
  `test_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `total_questions` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tests`
--

INSERT INTO `tests` (`test_id`, `test_name`, `description`, `total_questions`, `created_at`) VALUES
(2, 'Compatibility Test', 'This is a simple compatibility test.', 25, '2024-09-26 01:40:15');

-- --------------------------------------------------------

--
-- Table structure for table `test_progress`
--

CREATE TABLE `test_progress` (
  `progress_id` int NOT NULL,
  `user_id` int NOT NULL,
  `test_id` int NOT NULL,
  `question_id` int NOT NULL,
  `selected_answer_id` int DEFAULT NULL,
  `progress_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `points_received` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `test_progress`
--

INSERT INTO `test_progress` (`progress_id`, `user_id`, `test_id`, `question_id`, `selected_answer_id`, `progress_timestamp`, `points_received`) VALUES
(1, 7, 2, 1, 1, '2024-09-28 02:21:25', 4),
(2, 7, 2, 2, 8, '2024-09-28 02:21:41', 1),
(3, 7, 2, 3, 9, '2024-09-28 02:21:44', 4),
(4, 7, 2, 4, 16, '2024-09-28 02:21:46', 1),
(5, 7, 2, 5, 17, '2024-09-28 02:21:49', 4),
(6, 7, 2, 6, 24, '2024-09-28 02:21:51', 1),
(7, 7, 2, 7, 28, '2024-09-28 02:21:53', 1),
(8, 7, 2, 8, 30, '2024-09-28 02:21:56', 3),
(9, 7, 2, 9, 35, '2024-09-28 02:21:58', 2),
(10, 7, 2, 10, 37, '2024-09-28 02:22:01', 4),
(11, 7, 2, 11, 42, '2024-09-28 02:22:03', 3),
(12, 7, 2, 12, 47, '2024-09-28 02:22:05', 2),
(13, 7, 2, 13, 52, '2024-09-28 02:22:08', 1),
(14, 7, 2, 14, 56, '2024-09-28 02:22:11', 1),
(15, 7, 2, 15, 57, '2024-09-28 02:22:15', 4),
(16, 7, 2, 16, 61, '2024-09-28 02:22:18', 4),
(17, 7, 2, 17, 66, '2024-09-28 02:22:20', 3),
(18, 7, 2, 18, 70, '2024-09-28 02:22:24', 3),
(19, 7, 2, 19, 76, '2024-09-28 02:22:27', 1),
(20, 7, 2, 20, 80, '2024-09-28 02:22:29', 1),
(21, 7, 2, 21, 84, '2024-09-28 02:22:31', 1),
(22, 7, 2, 22, 88, '2024-09-28 02:22:33', 1),
(23, 7, 2, 23, 92, '2024-09-28 02:22:36', 1),
(24, 7, 2, 24, 96, '2024-09-28 02:22:38', 1),
(28, 7, 2, 25, 100, '2024-09-28 02:30:52', 1),
(29, 8, 2, 1, 4, '2024-09-28 05:57:42', 1),
(30, 8, 2, 2, 5, '2024-09-28 05:57:42', 4),
(31, 8, 2, 3, 11, '2024-09-28 05:57:43', 2),
(32, 8, 2, 4, 16, '2024-09-28 05:57:44', 1),
(33, 8, 2, 5, 20, '2024-09-28 05:57:46', 1),
(34, 8, 2, 6, 24, '2024-09-28 05:57:46', 1),
(35, 8, 2, 7, 28, '2024-09-28 05:57:47', 1),
(36, 8, 2, 8, 29, '2024-09-28 05:57:48', 4),
(37, 8, 2, 9, 35, '2024-09-28 05:57:50', 2),
(38, 8, 2, 10, 38, '2024-09-28 05:57:52', 3),
(39, 8, 2, 11, 43, '2024-09-28 05:57:56', 2),
(40, 8, 2, 12, 48, '2024-09-28 05:57:58', 1),
(41, 8, 2, 13, 50, '2024-09-28 05:57:59', 3),
(42, 8, 2, 14, 56, '2024-09-28 05:58:01', 1),
(43, 8, 2, 15, 57, '2024-09-28 05:58:03', 4),
(44, 8, 2, 16, 62, '2024-09-28 05:58:09', 3),
(45, 8, 2, 17, 67, '2024-09-28 05:58:13', 2),
(46, 8, 2, 18, 69, '2024-09-28 05:58:22', 4),
(47, 8, 2, 19, 76, '2024-09-28 05:58:31', 1),
(48, 8, 2, 20, 78, '2024-09-28 05:58:37', 3),
(49, 8, 2, 21, 81, '2024-09-28 05:58:40', 4),
(50, 8, 2, 22, 88, '2024-09-28 05:58:48', 1),
(51, 8, 2, 23, 90, '2024-09-28 05:58:53', 3),
(52, 8, 2, 24, 96, '2024-09-28 05:58:56', 1),
(53, 8, 2, 25, 97, '2024-09-28 05:59:04', 4),
(54, 9, 2, 1, 1, '2024-09-28 07:42:33', 4),
(55, 9, 2, 2, 8, '2024-09-28 07:42:33', 1),
(56, 9, 2, 3, 10, '2024-09-28 07:42:35', 3),
(57, 9, 2, 4, 16, '2024-09-28 07:42:36', 1),
(58, 9, 2, 5, 20, '2024-09-28 07:42:37', 1),
(59, 9, 2, 6, 24, '2024-09-28 07:42:38', 1),
(60, 9, 2, 7, 28, '2024-09-28 07:42:39', 1),
(61, 9, 2, 8, 32, '2024-09-28 07:42:39', 1),
(62, 9, 2, 9, 36, '2024-09-28 07:42:40', 1),
(63, 9, 2, 10, 39, '2024-09-28 07:42:41', 2),
(64, 9, 2, 11, 44, '2024-09-28 07:42:42', 1),
(65, 9, 2, 12, 48, '2024-09-28 07:42:43', 1),
(66, 9, 2, 13, 52, '2024-09-28 07:42:44', 1),
(67, 9, 2, 14, 56, '2024-09-28 07:42:45', 1),
(68, 9, 2, 15, 60, '2024-09-28 07:42:47', 1),
(69, 9, 2, 16, 64, '2024-09-28 07:42:48', 1),
(70, 9, 2, 17, 68, '2024-09-28 07:42:49', 1),
(71, 9, 2, 18, 72, '2024-09-28 07:42:50', 1),
(72, 9, 2, 19, 75, '2024-09-28 07:42:52', 2),
(73, 9, 2, 20, 80, '2024-09-28 07:42:53', 1),
(74, 9, 2, 21, 84, '2024-09-28 07:42:54', 1),
(75, 9, 2, 22, 88, '2024-09-28 07:42:55', 1),
(76, 9, 2, 23, 92, '2024-09-28 07:42:56', 1),
(77, 9, 2, 24, 96, '2024-09-28 07:42:58', 1),
(78, 9, 2, 25, 100, '2024-09-28 07:42:59', 1),
(79, 10, 2, 1, 1, '2024-09-28 08:58:04', 4),
(80, 10, 2, 2, 8, '2024-09-28 08:58:05', 1),
(81, 10, 2, 3, 11, '2024-09-28 08:58:05', 2),
(82, 10, 2, 4, 14, '2024-09-28 08:58:07', 3),
(83, 10, 2, 5, 20, '2024-09-28 08:58:08', 1),
(84, 10, 2, 6, 21, '2024-09-28 08:58:09', 4),
(85, 10, 2, 7, 26, '2024-09-28 08:58:09', 3),
(86, 10, 2, 8, 31, '2024-09-28 08:58:11', 2),
(87, 10, 2, 9, 35, '2024-09-28 08:58:12', 2),
(88, 10, 2, 10, 40, '2024-09-28 08:58:14', 1),
(89, 10, 2, 11, 42, '2024-09-28 08:58:15', 3),
(90, 10, 2, 12, 47, '2024-09-28 08:58:16', 2),
(91, 10, 2, 13, 52, '2024-09-28 08:58:19', 1),
(92, 10, 2, 14, 55, '2024-09-28 08:58:20', 2),
(93, 10, 2, 15, 60, '2024-09-28 08:58:21', 1),
(94, 10, 2, 16, 64, '2024-09-28 08:58:23', 1),
(95, 10, 2, 17, 68, '2024-09-28 08:58:24', 1),
(96, 10, 2, 18, 69, '2024-09-28 08:58:25', 4),
(97, 10, 2, 19, 76, '2024-09-28 08:58:26', 1),
(98, 10, 2, 20, 80, '2024-09-28 08:58:28', 1),
(99, 10, 2, 21, 82, '2024-09-28 08:58:29', 3),
(100, 10, 2, 22, 87, '2024-09-28 08:58:31', 2),
(101, 10, 2, 23, 92, '2024-09-28 08:58:33', 1),
(102, 10, 2, 24, 96, '2024-09-28 08:58:34', 1),
(103, 10, 2, 25, 98, '2024-09-28 08:58:37', 3),
(104, 11, 2, 1, 4, '2024-09-28 09:21:02', 1),
(105, 11, 2, 2, 7, '2024-09-28 09:21:02', 2),
(106, 11, 2, 3, 10, '2024-09-28 09:21:02', 3),
(107, 11, 2, 4, 13, '2024-09-28 09:21:04', 4),
(108, 11, 2, 5, 19, '2024-09-28 09:21:05', 2),
(109, 11, 2, 6, 24, '2024-09-28 09:21:06', 1),
(110, 11, 2, 7, 26, '2024-09-28 09:21:07', 3),
(111, 11, 2, 8, 31, '2024-09-28 09:21:08', 2),
(112, 11, 2, 9, 33, '2024-09-28 09:21:09', 4),
(113, 11, 2, 10, 37, '2024-09-28 09:21:11', 4),
(114, 11, 2, 11, 43, '2024-09-28 09:21:12', 2),
(115, 11, 2, 12, 47, '2024-09-28 09:21:13', 2),
(116, 11, 2, 13, 49, '2024-09-28 09:21:15', 4),
(117, 11, 2, 14, 54, '2024-09-28 09:21:16', 3),
(118, 11, 2, 15, 59, '2024-09-28 09:21:18', 2),
(119, 11, 2, 16, 64, '2024-09-28 09:21:19', 1),
(120, 11, 2, 17, 67, '2024-09-28 09:21:22', 2),
(121, 11, 2, 18, 72, '2024-09-28 09:21:23', 1),
(122, 11, 2, 19, 73, '2024-09-28 09:21:25', 4),
(123, 11, 2, 20, 78, '2024-09-28 09:21:27', 3),
(124, 11, 2, 21, 81, '2024-09-28 09:21:29', 4),
(125, 11, 2, 22, 87, '2024-09-28 09:21:31', 2),
(126, 11, 2, 23, 89, '2024-09-28 09:21:33', 4),
(127, 11, 2, 24, 96, '2024-09-28 09:21:35', 1),
(128, 11, 2, 25, 99, '2024-09-28 09:21:36', 2),
(129, 16, 2, 1, 3, '2024-09-29 02:14:10', 2),
(130, 16, 2, 2, 5, '2024-09-29 02:14:12', 4),
(131, 16, 2, 3, 9, '2024-09-29 02:14:13', 4),
(132, 16, 2, 4, 13, '2024-09-29 02:14:14', 4),
(133, 16, 2, 5, 17, '2024-09-29 02:14:15', 4),
(134, 16, 2, 6, 21, '2024-09-29 02:14:16', 4),
(135, 16, 2, 7, 25, '2024-09-29 02:14:18', 4),
(136, 16, 2, 8, 29, '2024-09-29 02:14:19', 4),
(137, 16, 2, 9, 33, '2024-09-29 02:14:20', 4),
(138, 16, 2, 10, 37, '2024-09-29 02:14:21', 4),
(139, 16, 2, 11, 41, '2024-09-29 02:14:22', 4),
(140, 16, 2, 12, 45, '2024-09-29 02:14:24', 4),
(141, 16, 2, 13, 49, '2024-09-29 02:14:25', 4),
(142, 16, 2, 14, 53, '2024-09-29 02:14:26', 4),
(143, 16, 2, 15, 57, '2024-09-29 02:14:28', 4),
(144, 16, 2, 16, 61, '2024-09-29 02:14:29', 4),
(145, 16, 2, 17, 65, '2024-09-29 02:14:30', 4),
(146, 16, 2, 18, 69, '2024-09-29 02:14:31', 4),
(147, 16, 2, 19, 73, '2024-09-29 02:14:33', 4),
(148, 16, 2, 20, 77, '2024-09-29 02:14:35', 4),
(149, 16, 2, 21, 81, '2024-09-29 02:14:36', 4),
(150, 16, 2, 22, 85, '2024-09-29 02:14:38', 4),
(151, 16, 2, 23, 89, '2024-09-29 02:14:39', 4),
(152, 16, 2, 24, 93, '2024-09-29 02:14:41', 4),
(153, 16, 2, 25, 99, '2024-09-29 02:14:56', 2),
(154, 17, 2, 1, 1, '2024-09-29 02:21:12', 4),
(155, 17, 2, 2, 8, '2024-09-29 02:21:13', 1),
(156, 17, 2, 3, 12, '2024-09-29 02:21:15', 1),
(157, 17, 2, 4, 16, '2024-09-29 02:21:16', 1),
(158, 17, 2, 5, 20, '2024-09-29 02:21:18', 1),
(159, 17, 2, 6, 24, '2024-09-29 02:21:20', 1),
(160, 17, 2, 7, 28, '2024-09-29 02:21:22', 1),
(161, 17, 2, 8, 32, '2024-09-29 02:21:24', 1),
(162, 17, 2, 9, 36, '2024-09-29 02:21:26', 1),
(163, 17, 2, 10, 40, '2024-09-29 02:21:28', 1),
(164, 17, 2, 11, 44, '2024-09-29 02:21:30', 1),
(165, 17, 2, 12, 48, '2024-09-29 02:21:32', 1),
(166, 17, 2, 13, 52, '2024-09-29 02:21:34', 1),
(167, 17, 2, 14, 56, '2024-09-29 02:21:35', 1),
(168, 17, 2, 15, 60, '2024-09-29 02:21:38', 1),
(169, 17, 2, 16, 64, '2024-09-29 02:21:39', 1),
(170, 17, 2, 17, 68, '2024-09-29 02:21:41', 1),
(171, 17, 2, 18, 72, '2024-09-29 02:21:44', 1),
(172, 17, 2, 19, 76, '2024-09-29 02:21:46', 1),
(173, 17, 2, 20, 80, '2024-09-29 02:21:49', 1),
(174, 17, 2, 21, 84, '2024-09-29 02:21:51', 1),
(175, 17, 2, 22, 88, '2024-09-29 02:21:53', 1),
(176, 17, 2, 23, 92, '2024-09-29 02:21:56', 1),
(177, 17, 2, 24, 96, '2024-09-29 02:21:58', 1),
(178, 17, 2, 25, 100, '2024-09-29 02:22:00', 1),
(179, 18, 2, 1, 4, '2025-04-07 12:00:28', 1),
(180, 18, 2, 2, 8, '2025-04-07 12:00:29', 1),
(181, 18, 2, 3, 12, '2025-04-07 12:00:30', 1),
(182, 18, 2, 4, 16, '2025-04-07 12:00:31', 1),
(183, 18, 2, 5, 20, '2025-04-07 12:00:33', 1),
(184, 18, 2, 6, 24, '2025-04-07 12:00:34', 1),
(185, 18, 2, 7, 28, '2025-04-07 12:00:35', 1),
(186, 18, 2, 8, 32, '2025-04-07 12:00:36', 1),
(187, 18, 2, 9, 36, '2025-04-07 12:00:38', 1),
(188, 18, 2, 10, 40, '2025-04-07 12:00:39', 1),
(189, 18, 2, 11, 44, '2025-04-07 12:00:41', 1),
(190, 18, 2, 12, 48, '2025-04-07 12:00:42', 1),
(191, 18, 2, 13, 52, '2025-04-07 12:00:43', 1),
(192, 18, 2, 14, 56, '2025-04-07 12:00:44', 1),
(193, 18, 2, 15, 60, '2025-04-07 12:00:46', 1),
(194, 18, 2, 16, 64, '2025-04-07 12:00:48', 1),
(195, 18, 2, 17, 68, '2025-04-07 12:00:49', 1),
(196, 18, 2, 18, 72, '2025-04-07 12:00:51', 1),
(197, 18, 2, 19, 76, '2025-04-07 12:00:53', 1),
(198, 18, 2, 20, 80, '2025-04-07 12:00:54', 1),
(199, 18, 2, 21, 84, '2025-04-07 12:00:56', 1),
(200, 18, 2, 22, 88, '2025-04-07 12:00:57', 1),
(201, 18, 2, 23, 92, '2025-04-07 12:00:59', 1),
(202, 18, 2, 24, 96, '2025-04-07 12:01:00', 1),
(203, 18, 2, 25, 100, '2025-04-07 12:01:01', 1),
(204, 19, 2, 1, 1, '2025-04-07 13:44:51', 4),
(205, 19, 2, 2, 5, '2025-04-07 13:44:58', 4),
(206, 19, 2, 3, 10, '2025-04-07 13:45:22', 3),
(207, 19, 2, 4, 14, '2025-04-07 13:45:30', 3),
(208, 19, 2, 5, 18, '2025-04-07 13:45:57', 3),
(209, 19, 2, 6, 23, '2025-04-07 13:46:14', 2),
(210, 19, 2, 7, 28, '2025-04-07 13:46:42', 1),
(211, 19, 2, 8, 31, '2025-04-07 13:47:49', 2),
(212, 19, 2, 9, 36, '2025-04-07 13:48:47', 1),
(213, 19, 2, 10, 37, '2025-04-07 13:48:58', 4),
(214, 19, 2, 11, 43, '2025-04-07 13:49:18', 2),
(215, 19, 2, 12, 46, '2025-04-07 13:49:39', 3),
(216, 19, 2, 13, 51, '2025-04-07 13:49:50', 2),
(217, 19, 2, 14, 54, '2025-04-07 13:51:18', 3),
(218, 19, 2, 15, 59, '2025-04-07 13:52:04', 2),
(219, 19, 2, 16, 61, '2025-04-07 13:55:02', 4),
(220, 19, 2, 17, 67, '2025-04-07 13:55:12', 2),
(221, 19, 2, 18, 70, '2025-04-07 13:57:14', 3),
(222, 19, 2, 19, 73, '2025-04-07 13:57:29', 4),
(223, 19, 2, 20, 78, '2025-04-07 13:58:18', 3),
(224, 19, 2, 21, 83, '2025-04-07 13:58:36', 2),
(225, 19, 2, 22, 86, '2025-04-07 13:58:45', 3),
(226, 19, 2, 23, 89, '2025-04-07 13:58:51', 4),
(227, 19, 2, 24, 93, '2025-04-07 13:59:04', 4),
(228, 19, 2, 25, 98, '2025-04-07 13:59:15', 3),
(229, 20, 2, 1, 1, '2025-04-07 14:20:12', 4),
(230, 20, 2, 2, 6, '2025-04-07 14:20:18', 3),
(231, 20, 2, 3, 12, '2025-04-07 14:20:36', 1),
(232, 20, 2, 4, 14, '2025-04-07 14:20:52', 3),
(233, 20, 2, 5, 19, '2025-04-07 14:21:20', 2),
(234, 20, 2, 6, 22, '2025-04-07 14:21:36', 3),
(235, 20, 2, 7, 26, '2025-04-07 14:21:51', 3),
(236, 20, 2, 8, 30, '2025-04-07 14:22:01', 3),
(237, 20, 2, 9, 33, '2025-04-07 14:22:12', 4),
(238, 20, 2, 10, 37, '2025-04-07 14:22:25', 4),
(239, 20, 2, 11, 42, '2025-04-07 14:22:34', 3),
(240, 20, 2, 12, 46, '2025-04-07 14:22:47', 3),
(241, 20, 2, 13, 49, '2025-04-07 14:23:05', 4),
(242, 20, 2, 14, 54, '2025-04-07 14:23:19', 3),
(243, 20, 2, 15, 59, '2025-04-07 14:23:29', 2),
(244, 20, 2, 16, 62, '2025-04-07 14:23:46', 3),
(245, 20, 2, 17, 66, '2025-04-07 14:23:55', 3),
(246, 20, 2, 18, 69, '2025-04-07 14:24:04', 4),
(247, 20, 2, 19, 74, '2025-04-07 14:24:16', 3),
(248, 20, 2, 20, 78, '2025-04-07 14:27:28', 3),
(249, 20, 2, 21, 81, '2025-04-07 14:27:37', 4),
(250, 20, 2, 22, 86, '2025-04-07 14:27:59', 3),
(251, 20, 2, 23, 90, '2025-04-07 14:28:11', 3),
(252, 20, 2, 24, 94, '2025-04-07 14:28:23', 3),
(253, 20, 2, 25, 98, '2025-04-07 14:28:36', 3),
(254, 22, 2, 1, 2, '2025-04-08 04:51:07', 3),
(255, 22, 2, 2, 6, '2025-04-08 04:51:08', 3),
(256, 22, 2, 3, 10, '2025-04-08 04:51:10', 3),
(257, 22, 2, 4, 14, '2025-04-08 04:51:11', 3),
(258, 22, 2, 5, 18, '2025-04-08 04:51:12', 3),
(259, 22, 2, 6, 22, '2025-04-08 04:51:13', 3),
(260, 22, 2, 7, 26, '2025-04-08 04:51:14', 3),
(261, 22, 2, 8, 30, '2025-04-08 04:51:15', 3),
(262, 22, 2, 9, 34, '2025-04-08 04:51:16', 3),
(263, 22, 2, 10, 38, '2025-04-08 04:51:17', 3),
(264, 22, 2, 11, 42, '2025-04-08 04:51:18', 3),
(265, 22, 2, 12, 46, '2025-04-08 04:51:19', 3),
(266, 22, 2, 13, 50, '2025-04-08 04:51:20', 3),
(267, 22, 2, 14, 54, '2025-04-08 04:51:21', 3),
(268, 22, 2, 15, 58, '2025-04-08 04:51:22', 3),
(269, 22, 2, 16, 62, '2025-04-08 04:51:23', 3),
(270, 22, 2, 17, 66, '2025-04-08 04:51:24', 3),
(271, 22, 2, 18, 70, '2025-04-08 04:51:27', 3),
(272, 22, 2, 19, 74, '2025-04-08 04:51:28', 3),
(273, 22, 2, 20, 78, '2025-04-08 04:51:29', 3),
(274, 22, 2, 21, 82, '2025-04-08 04:51:30', 3),
(275, 22, 2, 22, 86, '2025-04-08 04:51:31', 3),
(276, 22, 2, 23, 90, '2025-04-08 04:51:32', 3),
(277, 22, 2, 24, 94, '2025-04-08 04:51:33', 3),
(278, 22, 2, 25, 98, '2025-04-08 04:51:34', 3),
(279, 23, 2, 1, 4, '2025-04-10 11:33:13', 1),
(280, 23, 2, 2, 8, '2025-04-10 11:33:14', 1),
(281, 23, 2, 3, 11, '2025-04-10 11:33:15', 2),
(282, 23, 2, 4, 15, '2025-04-10 11:33:18', 2),
(283, 23, 2, 5, 20, '2025-04-10 11:33:18', 1),
(284, 23, 2, 6, 24, '2025-04-10 11:33:19', 1),
(285, 23, 2, 7, 27, '2025-04-10 11:33:20', 2),
(286, 23, 2, 8, 32, '2025-04-10 11:33:21', 1),
(287, 23, 2, 9, 36, '2025-04-10 11:33:22', 1),
(288, 23, 2, 10, 40, '2025-04-10 11:33:22', 1),
(289, 23, 2, 11, 44, '2025-04-10 11:33:23', 1),
(290, 23, 2, 12, 48, '2025-04-10 11:33:24', 1),
(291, 23, 2, 13, 52, '2025-04-10 11:33:25', 1),
(292, 23, 2, 14, 55, '2025-04-10 11:33:26', 2),
(293, 23, 2, 15, 58, '2025-04-10 11:33:27', 3),
(294, 23, 2, 16, 61, '2025-04-10 11:33:29', 4),
(295, 23, 2, 17, 67, '2025-04-10 11:33:30', 2),
(296, 23, 2, 18, 72, '2025-04-10 11:33:31', 1),
(297, 23, 2, 19, 75, '2025-04-10 11:33:32', 2),
(298, 23, 2, 20, 80, '2025-04-10 11:33:33', 1),
(299, 23, 2, 21, 84, '2025-04-10 11:33:34', 1),
(300, 23, 2, 22, 87, '2025-04-10 11:33:35', 2),
(301, 23, 2, 23, 91, '2025-04-10 11:33:36', 2),
(302, 23, 2, 24, 93, '2025-04-10 11:33:38', 4),
(303, 23, 2, 25, 100, '2025-04-10 11:33:39', 1),
(304, 24, 2, 1, 4, '2025-04-10 11:37:56', 1),
(305, 24, 2, 2, 8, '2025-04-10 11:37:57', 1),
(306, 24, 2, 3, 12, '2025-04-10 11:37:57', 1),
(307, 24, 2, 4, 16, '2025-04-10 11:37:58', 1),
(308, 24, 2, 5, 20, '2025-04-10 11:37:59', 1),
(309, 24, 2, 6, 23, '2025-04-10 11:38:00', 2),
(310, 24, 2, 7, 28, '2025-04-10 11:38:00', 1),
(311, 24, 2, 8, 32, '2025-04-10 11:38:01', 1),
(312, 24, 2, 9, 35, '2025-04-10 11:38:02', 2),
(313, 24, 2, 10, 40, '2025-04-10 11:38:03', 1),
(314, 24, 2, 11, 44, '2025-04-10 11:38:05', 1),
(315, 24, 2, 12, 47, '2025-04-10 11:38:06', 2),
(316, 24, 2, 13, 52, '2025-04-10 11:38:07', 1),
(317, 24, 2, 14, 55, '2025-04-10 11:38:08', 2),
(318, 24, 2, 15, 60, '2025-04-10 11:38:09', 1),
(319, 24, 2, 16, 63, '2025-04-10 11:38:11', 2),
(320, 24, 2, 17, 66, '2025-04-10 11:38:12', 3),
(321, 24, 2, 18, 72, '2025-04-10 11:38:13', 1),
(322, 24, 2, 19, 76, '2025-04-10 11:38:14', 1),
(323, 24, 2, 20, 79, '2025-04-10 11:38:15', 2),
(324, 24, 2, 21, 84, '2025-04-10 11:38:16', 1),
(325, 24, 2, 22, 87, '2025-04-10 11:38:17', 2),
(326, 24, 2, 23, 92, '2025-04-10 11:38:17', 1),
(327, 24, 2, 24, 95, '2025-04-10 11:38:18', 2),
(328, 24, 2, 25, 98, '2025-04-10 11:38:21', 3),
(329, 25, 2, 1, 1, '2025-04-11 12:32:19', 4),
(330, 25, 2, 2, 6, '2025-04-11 12:32:20', 3),
(331, 25, 2, 3, 10, '2025-04-11 12:32:21', 3),
(332, 25, 2, 4, 15, '2025-04-11 12:32:22', 2),
(333, 25, 2, 5, 19, '2025-04-11 12:32:23', 2),
(334, 25, 2, 6, 22, '2025-04-11 12:32:25', 3),
(335, 25, 2, 7, 25, '2025-04-11 12:32:26', 4),
(336, 25, 2, 8, 29, '2025-04-11 12:32:28', 4),
(337, 25, 2, 9, 33, '2025-04-11 12:32:30', 4),
(338, 25, 2, 10, 37, '2025-04-11 12:32:31', 4),
(339, 25, 2, 11, 42, '2025-04-11 12:32:33', 3),
(340, 25, 2, 12, 46, '2025-04-11 12:32:35', 3),
(341, 25, 2, 13, 51, '2025-04-11 12:32:36', 2),
(342, 25, 2, 14, 54, '2025-04-11 12:32:38', 3),
(343, 25, 2, 15, 58, '2025-04-11 12:32:40', 3),
(344, 25, 2, 16, 63, '2025-04-11 12:32:41', 2),
(345, 25, 2, 17, 66, '2025-04-11 12:32:43', 3),
(346, 25, 2, 18, 70, '2025-04-11 12:32:44', 3),
(347, 25, 2, 19, 75, '2025-04-11 12:32:47', 2),
(348, 25, 2, 20, 80, '2025-04-11 12:32:48', 1),
(349, 25, 2, 21, 81, '2025-04-11 12:32:50', 4),
(350, 25, 2, 22, 86, '2025-04-11 12:32:56', 3),
(351, 25, 2, 23, 91, '2025-04-11 12:32:58', 2),
(352, 25, 2, 24, 94, '2025-04-11 12:33:00', 3),
(353, 25, 2, 25, 98, '2025-04-11 12:33:02', 3),
(354, 26, 2, 1, 1, '2025-04-12 15:27:15', 4),
(355, 26, 2, 2, 6, '2025-04-12 15:27:44', 3),
(356, 26, 2, 3, 10, '2025-04-12 15:27:47', 3),
(357, 26, 2, 4, 14, '2025-04-12 15:27:50', 3),
(358, 26, 2, 5, 19, '2025-04-12 15:27:52', 2),
(359, 26, 2, 6, 23, '2025-04-12 15:27:55', 2),
(360, 26, 2, 7, 26, '2025-04-12 15:27:58', 3),
(361, 26, 2, 8, 31, '2025-04-12 15:28:01', 2),
(362, 26, 2, 9, 35, '2025-04-12 15:28:04', 2),
(363, 26, 2, 10, 39, '2025-04-12 15:28:09', 2),
(364, 26, 2, 11, 43, '2025-04-12 15:28:11', 2),
(365, 26, 2, 12, 45, '2025-04-12 15:32:00', 4),
(366, 26, 2, 13, 49, '2025-04-12 15:32:10', 4),
(367, 26, 2, 14, 53, '2025-04-12 15:32:14', 4),
(368, 26, 2, 15, 57, '2025-04-12 15:32:18', 4),
(369, 26, 2, 16, 61, '2025-04-12 15:32:24', 4),
(370, 26, 2, 17, 67, '2025-04-12 15:32:28', 2),
(371, 26, 2, 18, 70, '2025-04-12 15:32:30', 3),
(372, 26, 2, 19, 73, '2025-04-12 15:32:32', 4),
(373, 26, 2, 20, 77, '2025-04-12 15:32:34', 4),
(374, 26, 2, 21, 81, '2025-04-12 15:32:36', 4),
(375, 26, 2, 22, 85, '2025-04-12 15:32:38', 4),
(376, 26, 2, 23, 89, '2025-04-12 15:32:42', 4),
(377, 26, 2, 24, 93, '2025-04-12 15:32:44', 4),
(378, 26, 2, 25, 97, '2025-04-12 15:32:47', 4),
(379, 27, 2, 1, 1, '2025-04-13 11:25:21', 4),
(380, 27, 2, 2, 6, '2025-04-13 11:25:24', 3),
(381, 27, 2, 3, 11, '2025-04-13 11:25:27', 2),
(382, 27, 2, 4, 15, '2025-04-13 11:25:29', 2),
(383, 27, 2, 5, 18, '2025-04-13 11:25:32', 3),
(384, 27, 2, 6, 23, '2025-04-13 11:25:35', 2),
(385, 27, 2, 7, 27, '2025-04-13 11:25:37', 2),
(386, 27, 2, 8, 30, '2025-04-13 11:25:40', 3),
(387, 27, 2, 9, 33, '2025-04-13 11:25:42', 4),
(388, 27, 2, 10, 38, '2025-04-13 11:25:44', 3),
(389, 27, 2, 11, 43, '2025-04-13 11:25:47', 2),
(390, 27, 2, 12, 46, '2025-04-13 11:25:56', 3),
(391, 27, 2, 13, 51, '2025-04-13 11:25:58', 2),
(392, 27, 2, 14, 56, '2025-04-13 11:26:01', 1),
(393, 27, 2, 15, 59, '2025-04-13 11:26:03', 2),
(394, 27, 2, 16, 62, '2025-04-13 11:26:06', 3),
(395, 27, 2, 17, 66, '2025-04-13 11:26:09', 3),
(396, 27, 2, 18, 70, '2025-04-13 11:26:11', 3),
(397, 27, 2, 19, 75, '2025-04-13 11:26:14', 2),
(398, 27, 2, 20, 78, '2025-04-13 11:26:16', 3),
(399, 27, 2, 21, 83, '2025-04-13 11:26:18', 2),
(400, 27, 2, 22, 86, '2025-04-13 11:26:21', 3),
(401, 27, 2, 23, 90, '2025-04-13 11:26:24', 3),
(402, 27, 2, 24, 94, '2025-04-13 11:26:26', 3),
(403, 27, 2, 25, 98, '2025-04-13 11:26:31', 3),
(404, 28, 2, 1, 1, '2025-04-13 12:00:35', 4),
(405, 28, 2, 2, 7, '2025-04-13 12:00:38', 2),
(406, 28, 2, 3, 9, '2025-04-13 12:00:41', 4),
(407, 28, 2, 4, 15, '2025-04-13 12:00:44', 2),
(408, 28, 2, 5, 18, '2025-04-13 12:00:46', 3),
(409, 28, 2, 6, 22, '2025-04-13 12:00:50', 3),
(410, 28, 2, 7, 26, '2025-04-13 12:00:52', 3),
(411, 28, 2, 8, 30, '2025-04-13 12:00:55', 3),
(412, 28, 2, 9, 34, '2025-04-13 12:00:58', 3),
(413, 28, 2, 10, 38, '2025-04-13 12:01:01', 3),
(414, 28, 2, 11, 42, '2025-04-13 12:01:03', 3),
(415, 28, 2, 12, 46, '2025-04-13 12:01:05', 3),
(416, 28, 2, 13, 49, '2025-04-13 12:01:07', 4),
(417, 28, 2, 14, 56, '2025-04-13 12:01:10', 1),
(418, 28, 2, 15, 59, '2025-04-13 12:01:13', 2),
(419, 28, 2, 16, 63, '2025-04-13 12:01:14', 2),
(420, 28, 2, 17, 66, '2025-04-13 12:01:17', 3),
(421, 28, 2, 18, 72, '2025-04-13 12:01:19', 1),
(422, 28, 2, 19, 73, '2025-04-13 12:01:21', 4),
(423, 28, 2, 20, 74, '2025-04-13 12:01:23', 3),
(424, 28, 2, 21, 82, '2025-04-13 12:01:26', 3),
(425, 28, 2, 22, 87, '2025-04-13 12:01:28', 2),
(426, 28, 2, 23, 92, '2025-04-13 12:01:30', 1),
(427, 28, 2, 24, 93, '2025-04-13 12:01:32', 4),
(428, 28, 2, 25, 97, '2025-04-13 12:01:35', 4),
(429, 29, 2, 1, 1, '2025-04-13 13:57:13', 4),
(430, 29, 2, 2, 5, '2025-04-13 13:57:27', 4),
(431, 29, 2, 3, 10, '2025-04-13 13:58:19', 3),
(432, 29, 2, 4, 14, '2025-04-13 13:58:34', 3),
(433, 29, 2, 5, 19, '2025-04-13 13:58:59', 2),
(434, 29, 2, 6, 22, '2025-04-13 13:59:08', 3),
(435, 29, 2, 7, 27, '2025-04-13 13:59:25', 2),
(436, 29, 2, 8, 30, '2025-04-13 14:03:53', 3),
(437, 29, 2, 9, 35, '2025-04-13 14:05:22', 2),
(438, 29, 2, 10, 37, '2025-04-13 14:05:38', 4),
(439, 29, 2, 11, 42, '2025-04-13 14:06:02', 3),
(440, 29, 2, 12, 47, '2025-04-13 14:06:13', 2),
(441, 29, 2, 13, 50, '2025-04-13 14:06:50', 3),
(442, 29, 2, 14, 53, '2025-04-13 14:07:23', 4),
(443, 29, 2, 15, 58, '2025-04-13 14:07:33', 3),
(444, 29, 2, 16, 62, '2025-04-13 14:07:40', 3),
(445, 29, 2, 17, 66, '2025-04-13 14:07:59', 3),
(446, 29, 2, 18, 70, '2025-04-13 14:08:47', 3),
(447, 29, 2, 19, 74, '2025-04-13 14:09:02', 3),
(448, 29, 2, 20, 78, '2025-04-13 14:09:13', 3),
(449, 29, 2, 21, 83, '2025-04-13 14:09:52', 2),
(450, 29, 2, 22, 87, '2025-04-13 14:10:31', 2),
(451, 29, 2, 23, 89, '2025-04-13 14:10:39', 4),
(452, 29, 2, 24, 93, '2025-04-13 14:10:57', 4),
(453, 29, 2, 25, 98, '2025-04-13 14:11:13', 3),
(454, 31, 2, 1, 2, '2025-04-15 11:36:05', 3),
(455, 31, 2, 2, 7, '2025-04-15 11:36:08', 2),
(456, 31, 2, 3, 10, '2025-04-15 11:36:11', 3),
(457, 31, 2, 4, 15, '2025-04-15 11:36:14', 2),
(458, 31, 2, 5, 18, '2025-04-15 11:36:16', 3),
(459, 31, 2, 6, 21, '2025-04-15 11:36:19', 4),
(460, 31, 2, 7, 26, '2025-04-15 11:36:21', 3),
(461, 31, 2, 8, 31, '2025-04-15 11:36:25', 2),
(462, 31, 2, 9, 36, '2025-04-15 11:36:28', 1),
(463, 31, 2, 10, 39, '2025-04-15 11:36:31', 2),
(464, 31, 2, 11, 42, '2025-04-15 11:36:34', 3),
(465, 31, 2, 12, 48, '2025-04-15 11:36:37', 1),
(466, 31, 2, 13, 51, '2025-04-15 11:36:40', 2),
(467, 31, 2, 14, 56, '2025-04-15 11:36:49', 1),
(468, 31, 2, 15, 58, '2025-04-15 11:36:52', 3),
(469, 31, 2, 16, 63, '2025-04-15 11:36:55', 2),
(470, 31, 2, 17, 67, '2025-04-15 11:36:57', 2),
(471, 31, 2, 18, 70, '2025-04-15 11:37:00', 3),
(472, 31, 2, 19, 75, '2025-04-15 11:37:04', 2),
(473, 31, 2, 20, 79, '2025-04-15 11:37:08', 2),
(474, 31, 2, 21, 82, '2025-04-15 11:37:11', 3),
(475, 31, 2, 22, 86, '2025-04-15 11:37:15', 3),
(476, 31, 2, 23, 90, '2025-04-15 11:39:14', 3),
(477, 31, 2, 24, 94, '2025-04-15 11:39:36', 3),
(478, 31, 2, 25, 98, '2025-04-15 11:39:40', 3),
(479, 32, 2, 1, 2, '2025-04-15 11:51:02', 3),
(480, 32, 2, 2, 7, '2025-04-15 11:51:05', 2),
(481, 32, 2, 3, 10, '2025-04-15 11:51:07', 3),
(482, 32, 2, 4, 15, '2025-04-15 11:51:10', 2),
(483, 32, 2, 5, 18, '2025-04-15 11:51:12', 3),
(484, 32, 2, 6, 22, '2025-04-15 11:51:15', 3),
(485, 32, 2, 7, 28, '2025-04-15 11:51:18', 1),
(486, 32, 2, 8, 30, '2025-04-15 11:51:20', 3),
(487, 32, 2, 9, 34, '2025-04-15 11:51:23', 3),
(488, 32, 2, 10, 39, '2025-04-15 11:51:25', 2),
(489, 32, 2, 11, 41, '2025-04-15 11:51:27', 4),
(490, 32, 2, 12, 47, '2025-04-15 11:51:30', 2),
(491, 32, 2, 13, 50, '2025-04-15 11:51:32', 3),
(492, 32, 2, 14, 55, '2025-04-15 11:51:37', 2),
(493, 32, 2, 15, 58, '2025-04-15 11:51:40', 3),
(494, 32, 2, 16, 61, '2025-04-15 11:51:48', 4),
(495, 32, 2, 17, 67, '2025-04-15 11:51:51', 2),
(496, 32, 2, 18, 70, '2025-04-15 11:51:53', 3),
(497, 32, 2, 19, 75, '2025-04-15 11:51:56', 2),
(498, 32, 2, 20, 78, '2025-04-15 11:51:58', 3),
(499, 32, 2, 21, 84, '2025-04-15 11:52:01', 1),
(500, 32, 2, 22, 86, '2025-04-15 11:52:03', 3),
(501, 32, 2, 23, 89, '2025-04-15 11:52:06', 4),
(502, 32, 2, 24, 94, '2025-04-15 11:52:09', 3),
(503, 32, 2, 25, 99, '2025-04-15 11:52:11', 2),
(504, 33, 2, 1, 1, '2025-04-16 06:30:29', 4),
(505, 33, 2, 2, 8, '2025-04-16 06:30:44', 1),
(506, 34, 2, 1, 1, '2025-04-19 05:24:50', 4),
(507, 34, 2, 2, 5, '2025-04-19 05:24:58', 4),
(508, 34, 2, 3, 12, '2025-04-19 05:25:19', 1),
(509, 34, 2, 4, 13, '2025-04-19 05:27:28', 4),
(510, 34, 2, 5, 17, '2025-04-19 05:27:32', 4),
(511, 34, 2, 6, 21, '2025-04-19 05:27:35', 4),
(512, 34, 2, 7, 25, '2025-04-19 05:27:42', 4),
(513, 34, 2, 8, 29, '2025-04-19 05:27:53', 4),
(514, 35, 2, 1, 1, '2025-04-19 10:26:36', 4),
(515, 35, 2, 2, 6, '2025-04-19 10:26:47', 3),
(516, 35, 2, 3, 12, '2025-04-19 10:26:58', 1),
(517, 35, 2, 4, 14, '2025-04-19 10:27:06', 3),
(518, 35, 2, 5, 19, '2025-04-19 10:27:12', 2),
(519, 35, 2, 6, 22, '2025-04-19 10:27:17', 3),
(520, 35, 2, 7, 28, '2025-04-19 10:27:23', 1),
(521, 35, 2, 8, 31, '2025-04-19 10:27:31', 2),
(522, 35, 2, 9, 33, '2025-04-19 10:28:06', 4),
(523, 35, 2, 10, 38, '2025-04-19 10:28:12', 3),
(524, 35, 2, 11, 42, '2025-04-19 10:28:23', 3),
(525, 35, 2, 12, 46, '2025-04-19 10:28:45', 3),
(526, 35, 2, 13, 49, '2025-04-19 10:28:56', 4),
(527, 35, 2, 14, 54, '2025-04-19 10:29:09', 3),
(528, 35, 2, 15, 57, '2025-04-19 10:29:18', 4),
(529, 35, 2, 16, 62, '2025-04-19 10:30:08', 3),
(530, 35, 2, 17, 66, '2025-04-19 10:30:28', 3),
(531, 35, 2, 18, 71, '2025-04-19 10:30:43', 2),
(532, 35, 2, 19, 74, '2025-04-19 10:31:03', 3),
(533, 35, 2, 20, 78, '2025-04-19 10:31:14', 3),
(534, 35, 2, 21, 81, '2025-04-19 10:31:20', 4),
(535, 35, 2, 22, 86, '2025-04-19 10:31:30', 3),
(536, 35, 2, 23, 89, '2025-04-19 10:32:22', 4),
(537, 35, 2, 24, 94, '2025-04-19 10:32:36', 3),
(538, 35, 2, 25, 97, '2025-04-19 10:32:46', 4),
(539, 36, 2, 1, 1, '2025-04-19 13:50:15', 4),
(540, 36, 2, 2, 6, '2025-04-19 13:50:25', 3),
(541, 36, 2, 3, 12, '2025-04-19 13:50:35', 1),
(542, 36, 2, 4, 13, '2025-04-19 13:50:54', 4),
(543, 36, 2, 5, 19, '2025-04-19 13:51:08', 2),
(544, 36, 2, 6, 23, '2025-04-19 13:51:16', 2),
(545, 36, 2, 7, 26, '2025-04-19 13:51:25', 3),
(546, 36, 2, 8, 32, '2025-04-19 13:51:32', 1),
(547, 36, 2, 9, 35, '2025-04-19 13:51:41', 2),
(548, 36, 2, 10, 38, '2025-04-19 13:51:47', 3),
(549, 36, 2, 11, 41, '2025-04-19 13:51:54', 4),
(550, 36, 2, 12, 45, '2025-04-19 13:52:03', 4),
(551, 36, 2, 13, 51, '2025-04-19 13:52:13', 2),
(552, 36, 2, 14, 55, '2025-04-19 13:52:21', 2),
(553, 36, 2, 15, 57, '2025-04-19 13:52:27', 4),
(554, 36, 2, 16, 61, '2025-04-19 13:52:37', 4),
(555, 36, 2, 17, 66, '2025-04-19 13:52:43', 3),
(556, 36, 2, 18, 72, '2025-04-19 13:52:52', 1),
(557, 36, 2, 19, 73, '2025-04-19 13:52:58', 4),
(558, 36, 2, 20, 80, '2025-04-19 13:53:06', 1),
(559, 36, 2, 21, 82, '2025-04-19 13:53:14', 3),
(560, 36, 2, 22, 88, '2025-04-19 13:53:20', 1),
(561, 36, 2, 23, 91, '2025-04-19 13:53:27', 2),
(562, 36, 2, 24, 94, '2025-04-19 13:53:34', 3),
(563, 36, 2, 25, 98, '2025-04-19 13:53:42', 3),
(564, 34, 2, 9, 34, '2025-04-19 16:07:28', 3),
(565, 34, 2, 10, 40, '2025-04-19 16:07:29', 1),
(566, 34, 2, 11, 43, '2025-04-19 16:07:30', 2),
(567, 34, 2, 12, 45, '2025-04-19 16:07:32', 4),
(568, 34, 2, 13, 50, '2025-04-19 16:07:34', 3),
(569, 34, 2, 14, 56, '2025-04-19 16:07:37', 1),
(570, 34, 2, 15, 57, '2025-04-19 16:07:38', 4),
(571, 34, 2, 16, 62, '2025-04-19 16:07:39', 3),
(572, 34, 2, 17, 67, '2025-04-19 16:07:40', 2),
(573, 34, 2, 18, 72, '2025-04-19 16:07:41', 1),
(574, 34, 2, 19, 75, '2025-04-19 16:07:42', 2),
(575, 34, 2, 20, 77, '2025-04-19 16:07:43', 4),
(576, 34, 2, 21, 82, '2025-04-19 16:07:45', 3),
(577, 34, 2, 22, 87, '2025-04-19 16:07:46', 2),
(578, 34, 2, 23, 92, '2025-04-19 16:07:47', 1),
(579, 34, 2, 24, 96, '2025-04-19 16:07:50', 1),
(580, 34, 2, 25, 100, '2025-04-19 16:07:52', 1),
(581, 37, 2, 1, 1, '2025-04-19 17:12:45', 4),
(582, 37, 2, 2, 8, '2025-04-19 17:12:46', 1),
(583, 37, 2, 3, 10, '2025-04-19 17:12:48', 3),
(584, 37, 2, 4, 16, '2025-04-19 17:12:49', 1),
(585, 37, 2, 5, 19, '2025-04-19 17:12:49', 2),
(586, 37, 2, 6, 21, '2025-04-19 17:12:51', 4),
(587, 37, 2, 7, 26, '2025-04-19 17:12:52', 3),
(588, 37, 2, 8, 29, '2025-04-19 17:12:53', 4),
(589, 37, 2, 9, 35, '2025-04-19 17:12:54', 2),
(590, 37, 2, 10, 37, '2025-04-19 17:12:56', 4),
(591, 37, 2, 11, 42, '2025-04-19 17:12:57', 3),
(592, 37, 2, 12, 46, '2025-04-19 17:12:58', 3),
(593, 37, 2, 13, 49, '2025-04-19 17:12:59', 4),
(594, 37, 2, 14, 54, '2025-04-19 17:13:00', 3),
(595, 37, 2, 15, 58, '2025-04-19 17:13:01', 3),
(596, 37, 2, 16, 63, '2025-04-19 17:13:02', 2),
(597, 37, 2, 17, 66, '2025-04-19 17:13:03', 3),
(598, 37, 2, 18, 71, '2025-04-19 17:13:04', 2),
(599, 37, 2, 19, 74, '2025-04-19 17:13:05', 3),
(600, 37, 2, 20, 77, '2025-04-19 17:13:06', 4),
(601, 37, 2, 21, 82, '2025-04-19 17:13:07', 3),
(602, 37, 2, 22, 87, '2025-04-19 17:13:08', 2),
(603, 37, 2, 23, 91, '2025-04-19 17:13:09', 2),
(604, 37, 2, 24, 94, '2025-04-19 17:13:11', 3),
(605, 37, 2, 25, 98, '2025-04-19 17:13:13', 3),
(606, 39, 2, 1, 1, '2025-04-19 18:43:44', 4),
(607, 39, 2, 2, 8, '2025-04-19 18:43:46', 1),
(608, 39, 2, 3, 9, '2025-04-19 18:44:24', 4),
(609, 39, 2, 4, 16, '2025-04-19 18:44:25', 1),
(610, 39, 2, 5, 20, '2025-04-19 18:44:26', 1),
(611, 39, 2, 6, 23, '2025-04-19 18:44:26', 2),
(612, 39, 2, 7, 26, '2025-04-19 18:44:28', 3),
(613, 39, 2, 8, 29, '2025-04-19 18:44:29', 4),
(614, 39, 2, 9, 35, '2025-04-19 18:44:30', 2),
(615, 39, 2, 10, 40, '2025-04-19 18:44:31', 1),
(616, 39, 2, 11, 43, '2025-04-19 18:44:32', 2),
(617, 39, 2, 12, 46, '2025-04-19 18:44:33', 3),
(618, 39, 2, 13, 51, '2025-04-19 18:44:34', 2),
(619, 39, 2, 14, 56, '2025-04-19 18:44:35', 1),
(620, 39, 2, 15, 60, '2025-04-19 18:44:35', 1),
(621, 39, 2, 16, 64, '2025-04-19 18:44:36', 1),
(622, 39, 2, 17, 67, '2025-04-19 18:44:37', 2),
(623, 39, 2, 18, 69, '2025-04-19 18:44:39', 4),
(624, 39, 2, 19, 76, '2025-04-19 18:44:40', 1),
(625, 39, 2, 20, 79, '2025-04-19 18:44:41', 2),
(626, 39, 2, 21, 81, '2025-04-19 18:44:43', 4),
(627, 39, 2, 22, 87, '2025-04-19 18:44:45', 2),
(628, 39, 2, 23, 92, '2025-04-19 18:44:46', 1),
(629, 39, 2, 24, 95, '2025-04-19 18:44:47', 2),
(630, 39, 2, 25, 98, '2025-04-19 18:44:48', 3),
(631, 40, 2, 1, 4, '2025-04-19 19:30:22', 1),
(632, 40, 2, 2, 6, '2025-04-19 19:30:31', 3),
(633, 40, 2, 3, 10, '2025-04-19 19:30:35', 3),
(634, 40, 2, 4, 13, '2025-04-19 19:33:37', 4),
(635, 40, 2, 5, 17, '2025-04-19 19:33:42', 4),
(636, 40, 2, 6, 23, '2025-04-19 19:33:46', 2),
(637, 40, 2, 7, 26, '2025-04-19 19:33:49', 3),
(638, 40, 2, 8, 31, '2025-04-19 19:33:52', 2),
(639, 40, 2, 9, 36, '2025-04-19 19:33:54', 1),
(640, 40, 2, 10, 38, '2025-04-19 19:33:57', 3),
(641, 40, 2, 11, 43, '2025-04-19 19:33:59', 2),
(642, 40, 2, 12, 47, '2025-04-19 19:34:02', 2),
(643, 40, 2, 13, 51, '2025-04-19 19:34:04', 2),
(644, 40, 2, 14, 54, '2025-04-19 19:34:06', 3),
(645, 40, 2, 15, 57, '2025-04-19 19:34:08', 4),
(646, 40, 2, 16, 61, '2025-04-19 19:34:10', 4),
(647, 40, 2, 17, 65, '2025-04-19 19:34:12', 4),
(648, 40, 2, 18, 70, '2025-04-19 19:34:14', 3),
(649, 40, 2, 19, 73, '2025-04-19 19:34:16', 4),
(650, 40, 2, 20, 78, '2025-04-19 19:34:19', 3),
(651, 40, 2, 21, 81, '2025-04-19 19:34:21', 4),
(652, 40, 2, 22, 85, '2025-04-19 19:34:24', 4),
(653, 40, 2, 23, 90, '2025-04-19 19:34:28', 3),
(654, 40, 2, 24, 95, '2025-04-19 19:34:30', 2),
(655, 40, 2, 25, 100, '2025-04-19 19:34:32', 1),
(656, 41, 2, 1, 1, '2025-08-01 06:38:21', 4),
(657, 41, 2, 2, 6, '2025-08-01 06:38:25', 3),
(658, 41, 2, 3, 9, '2025-08-01 06:38:33', 4),
(659, 41, 2, 4, 14, '2025-08-01 06:38:36', 3),
(660, 41, 2, 5, 19, '2025-08-01 06:38:40', 2),
(661, 41, 2, 6, 22, '2025-08-01 06:38:49', 3),
(662, 41, 2, 7, 27, '2025-08-01 06:38:54', 2),
(663, 41, 2, 8, 30, '2025-08-01 06:39:05', 3),
(664, 41, 2, 9, 33, '2025-08-01 06:39:12', 4),
(665, 41, 2, 10, 37, '2025-08-01 06:39:15', 4),
(666, 41, 2, 11, 42, '2025-08-01 06:39:17', 3),
(667, 41, 2, 12, 45, '2025-08-01 06:39:30', 4),
(668, 41, 2, 13, 50, '2025-08-01 06:39:40', 3),
(669, 41, 2, 14, 56, '2025-08-01 06:39:43', 1),
(670, 41, 2, 15, 59, '2025-08-01 06:39:46', 2),
(671, 41, 2, 16, 63, '2025-08-01 06:39:49', 2),
(672, 41, 2, 17, 66, '2025-08-01 06:39:51', 3),
(673, 41, 2, 18, 71, '2025-08-01 06:40:01', 2),
(674, 41, 2, 19, 75, '2025-08-01 06:40:36', 2),
(675, 41, 2, 20, 78, '2025-08-01 06:40:51', 3),
(676, 41, 2, 21, 81, '2025-08-01 06:40:53', 4),
(677, 41, 2, 22, 86, '2025-08-01 06:40:55', 3),
(678, 41, 2, 23, 89, '2025-08-01 06:41:02', 4),
(679, 41, 2, 24, 93, '2025-08-01 06:41:06', 4),
(680, 41, 2, 25, 97, '2025-08-01 06:41:11', 4),
(681, 44, 2, 1, 2, '2025-08-04 13:43:07', 3),
(682, 44, 2, 2, 8, '2025-08-04 13:43:13', 1),
(683, 44, 2, 3, 11, '2025-08-04 13:43:16', 2),
(684, 44, 2, 4, 14, '2025-08-04 13:43:20', 3),
(685, 44, 2, 5, 19, '2025-08-04 13:43:22', 2),
(686, 44, 2, 6, 22, '2025-08-04 13:43:25', 3),
(687, 44, 2, 7, 27, '2025-08-04 13:43:28', 2),
(688, 44, 2, 8, 30, '2025-08-04 13:43:31', 3),
(689, 44, 2, 9, 34, '2025-08-04 13:43:35', 3),
(690, 44, 2, 10, 38, '2025-08-04 13:43:39', 3),
(691, 44, 2, 11, 42, '2025-08-04 13:43:42', 3),
(692, 44, 2, 12, 47, '2025-08-04 13:43:46', 2),
(693, 44, 2, 13, 51, '2025-08-04 13:43:55', 2),
(694, 44, 2, 14, 54, '2025-08-04 13:43:58', 3),
(695, 44, 2, 15, 58, '2025-08-04 13:44:01', 3),
(696, 44, 2, 16, 63, '2025-08-04 13:44:08', 2),
(697, 44, 2, 17, 66, '2025-08-04 13:44:14', 3),
(698, 44, 2, 18, 71, '2025-08-04 13:44:20', 2),
(699, 44, 2, 19, 74, '2025-08-04 13:44:27', 3),
(700, 44, 2, 20, 78, '2025-08-04 13:44:32', 3),
(701, 44, 2, 21, 83, '2025-08-04 13:44:36', 2),
(702, 44, 2, 22, 86, '2025-08-04 13:44:42', 3),
(703, 44, 2, 23, 91, '2025-08-04 13:44:47', 2),
(704, 44, 2, 24, 94, '2025-08-04 13:44:50', 3),
(705, 44, 2, 25, 98, '2025-08-04 13:44:55', 3),
(706, 45, 2, 1, 1, '2025-08-08 05:22:13', 4),
(707, 45, 2, 2, 6, '2025-08-08 05:22:19', 3),
(708, 45, 2, 3, 12, '2025-08-08 05:22:31', 1),
(709, 45, 2, 4, 13, '2025-08-08 05:22:39', 4),
(710, 45, 2, 5, 20, '2025-08-08 05:22:44', 1),
(711, 45, 2, 6, 22, '2025-08-08 05:22:56', 3),
(712, 45, 2, 7, 27, '2025-08-08 05:23:26', 2),
(713, 45, 2, 8, 31, '2025-08-08 05:23:33', 2),
(714, 45, 2, 9, 36, '2025-08-08 05:23:38', 1),
(715, 45, 2, 10, 38, '2025-08-08 05:23:45', 3),
(716, 45, 2, 11, 41, '2025-08-08 05:23:51', 4),
(717, 45, 2, 12, 45, '2025-08-08 05:23:56', 4),
(718, 45, 2, 13, 49, '2025-08-08 05:24:07', 4),
(719, 45, 2, 14, 54, '2025-08-08 05:24:12', 3),
(720, 45, 2, 15, 57, '2025-08-08 05:24:17', 4),
(721, 45, 2, 16, 62, '2025-08-08 05:24:26', 3),
(722, 45, 2, 17, 66, '2025-08-08 05:24:41', 3),
(723, 45, 2, 18, 71, '2025-08-08 05:24:49', 2),
(724, 45, 2, 19, 74, '2025-08-08 05:24:53', 3),
(725, 45, 2, 20, 78, '2025-08-08 05:24:58', 3),
(726, 45, 2, 21, 83, '2025-08-08 05:25:05', 2),
(727, 45, 2, 22, 88, '2025-08-08 05:25:09', 1),
(728, 45, 2, 23, 90, '2025-08-08 05:25:16', 3),
(729, 45, 2, 24, 93, '2025-08-08 05:26:33', 4),
(730, 45, 2, 25, 99, '2025-08-08 05:26:41', 2);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `birthDate` date NOT NULL,
  `password` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `current_plan` enum('free','pro','elite') COLLATE utf8mb4_general_ci DEFAULT 'free',
  `is_verified` tinyint(1) DEFAULT '0',
  `verification_date` timestamp NULL DEFAULT NULL,
  `profile_boost_active` tinyint(1) DEFAULT '0',
  `profile_boost_ends` timestamp NULL DEFAULT NULL,
  `subscription_status` enum('active','expired','trial') COLLATE utf8mb4_general_ci DEFAULT 'trial',
  `subscription_ends` timestamp NULL DEFAULT NULL,
  `gender` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_phone_verified` tinyint(1) DEFAULT '0',
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_email_verified` tinyint(1) DEFAULT '0',
  `profile_image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `country` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `religion` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `caste` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `height` decimal(5,2) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `income` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_profile_verified` tinyint(1) DEFAULT '0',
  `is_profile_complete` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `username`, `birthDate`, `password`, `current_plan`, `is_verified`, `verification_date`, `profile_boost_active`, `profile_boost_ends`, `subscription_status`, `subscription_ends`, `gender`, `phone`, `is_phone_verified`, `email`, `is_email_verified`, `profile_image_url`, `country`, `state`, `city`, `religion`, `caste`, `height`, `weight`, `income`, `is_profile_verified`, `is_profile_complete`) VALUES
(2, 'AvniG16748', '2024-09-15', 'U2FsdGVkX18pbUEur5Xibh3IvEikLThOgk13fKC7nvI=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(4, 'test2', '2024-09-15', 'U2FsdGVkX1/jZyjHZ1wYPzs2e4ORbcs/bJ85zds8NWQ=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(5, 'test', '1996-09-25', 'U2FsdGVkX1/WGESajEezeFRAkZ/a/UjnAd9MRDVPKgQ=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(6, 'test3', '1998-12-25', 'U2FsdGVkX1/ntNlv1z5BuLK+LLGd1Kq35D0OoXO5Hfw=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(7, 'test4', '1999-01-12', 'U2FsdGVkX19XZlXq/rmHgls/GWX0KEG9/i0szCCObQs=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(8, 'jino', '1999-06-28', 'U2FsdGVkX1+qeok5LSuGTid2SWr7X1injxJDboa+emA=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(9, 'jino2', '2001-06-28', 'U2FsdGVkX19XZF9IFbkipJccvYVEa6CThTmfoDBKtow=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(10, 'jino3', '1999-06-17', 'U2FsdGVkX185WQ8L9VJxI/tww5rn5cSupT5g14NqeIU=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(11, 'jino4', '2000-06-28', 'U2FsdGVkX1+DPPK0CLV4k16vuyhIWOOI1T2s8Km5Yks=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(12, 'Mrunal', '2004-04-22', 'U2FsdGVkX18CEfvJbX0uDhiTLgaZ7uGzx9ehqSKwcoU=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(13, 'Mrunu22', '2004-04-22', 'U2FsdGVkX1/RitoFq6lmvCcqGPsrGzcuzEUip2BwDRg=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(14, 'shakalaka', '2004-04-22', 'U2FsdGVkX18d0B07LB3K1XSyoVTGXNVAB4mfYZZI7ds=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(15, 'shakalaka22', '2004-04-22', 'U2FsdGVkX1/xXe2NcuAmMJa2ZfC7eRQOgjaRZqhTp4E=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(16, 'test5', '1996-12-12', 'U2FsdGVkX1/AcH6XdsHJa34YyE4Og19PvKeNuRb2qD8=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(17, 'test6', '1996-11-11', 'U2FsdGVkX18WtkrBpFyQPASSYDejuc/tfnA3+LhWXJ0=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(18, 'test_user_new', '2001-02-07', 'U2FsdGVkX194jss8kXLxV7iGLnbWLETBAwoYPlwHheI=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(19, 'karmun21', '2004-04-22', 'U2FsdGVkX18tjtKb4bDbENZ7rHYgrsbm1PrftZpqO/Y=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(20, 'test_user_00', '1999-06-23', 'U2FsdGVkX18Oa8KLuzptG5rgVT2om31QWtqg7t8fmkU=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(21, 'TestAccount75', '1999-07-08', 'U2FsdGVkX18wAQNzJPPpT+DIHlq8uDxgyHp9A5gtS2I=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(22, 'Dipu22', '2004-04-22', 'U2FsdGVkX19+ZiHus+k9ISVRo4fbxmkDGoQK+mkzP+s=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(23, 'test_user_01', '1999-06-10', 'U2FsdGVkX1/JiiuaCe1EnKqZc5nKPPT9l5EGPNo5Ybw=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(24, 'test_user_02', '1998-06-10', 'U2FsdGVkX1/nBg88nH6T0AJ3Hntkm4fKSNlLlp310As=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(25, 'Test user 55', '2002-01-11', 'U2FsdGVkX19AG90XFfixxAJs8XV5gO76+0TiDHKaETg=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(26, 'Test User 99', '2001-05-12', 'U2FsdGVkX1/h/tj4vR60xHEZ5+QFGGSEgdCS8bNU2Sg=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(27, 'testuser77', '2004-04-13', 'U2FsdGVkX1+0LbYWKuEXjBNYrVC9+bZG2xHtV6zOEhc=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(28, 'test_user_55', '2000-04-13', 'U2FsdGVkX1+9pNH7voWZsh+gE5iVsDYvbP+xAOeMoR8=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(29, 'Mrunu21', '2004-04-22', 'U2FsdGVkX1/pZnN54gnMpE0IsTP5fe37L02U0mosfy8=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(30, 'test_user_15', '2001-04-13', 'U2FsdGVkX1+f07IdqOpPykAug5TE6v9UwK/T95DoND4=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(31, 'test_user_03', '2001-02-02', 'U2FsdGVkX1+vRHZuWPJJnlgTDQ+lEXNuXeLnikTM+BA=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', '5555454642', 0, 'test@gmail.com', 0, 'file_6803a10ed558b4.70408486.png', 'India', 'TAmil Nadu', 'KKv', 'Hindu', 'TEST', 170.00, 80.00, '1111111', 0, 1),
(32, 'testuser101', '2002-04-15', 'U2FsdGVkX19sY3ljIvFRuCGXyjwWmVhRtwVQZzoVqEY=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(33, 'test_user_04', '2000-01-01', 'U2FsdGVkX1/jVHMNf7LScdx2ZONjEl4ABmyGAtO65H4=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(34, 'test_user_05', '2000-01-01', 'U2FsdGVkX1/bCbHJ7uiRch4lQuzJbISLbP07mjlPQ54=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(35, 'Ajay Radhakrishnan', '2005-03-10', 'U2FsdGVkX1+cyOtVF6IjTFFiRD2ZHFj7XES3hs0Du8k=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(36, 'testuser', '2003-04-19', 'U2FsdGVkX1/sI7QsWtmMdSRrMMtPYV2z+C3KtQCCgS8=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(37, 'test_user_06', '2000-02-01', 'U2FsdGVkX1+6UwYMCgN1TkxTjdTkVw6RtMlf8PM0fyg=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(38, 'test_user_07', '2001-01-01', 'U2FsdGVkX19+bXFyFuK14y7/iAjuhxhUvtv8pugURXk=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(39, 'test_user_08', '2001-01-01', 'U2FsdGVkX19Xs7IYqISDCmiYu1JUwFksWgUQ7DvWXWk=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(40, 'testuser102', '2002-05-20', 'U2FsdGVkX1/5Dzmh4vf6IRx8hAUwMa/yfshZn9KzokY=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(41, 'leo', '2002-01-01', 'U2FsdGVkX18kvdpDYLvj9VRDIFbUVvKsE6nvVEkIBEs=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(42, 'rolex', '2002-08-03', 'U2FsdGVkX1/vg9OPS73d5/azs7SlZR94P0NJimwC97k=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(43, 'thanos', '2001-05-07', 'U2FsdGVkX1+lRw+3ifzSrhBV+8yrUugQ+mMDDH4/MDQ=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(44, 'jose', '1999-05-13', 'U2FsdGVkX19AG90XFfixxAJs8XV5gO76+0TiDHKaETg=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(45, 'felicia', '2006-08-08', 'U2FsdGVkX19jGPDbRfNpWYoiT19X8PGCXH40omDhddE=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Female', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(46, 'leos2', '1998-08-14', 'U2FsdGVkX19G6dVIFWf+fsvkii5FxMtkO+cye1VDNh4=', 'pro', 0, NULL, 0, NULL, 'active', '2025-11-23 14:16:27', 'Male', '9469979797', 0, 'test123@gmail.com', 0, NULL, 'India', 'Karnataka', 'Bengaluru', NULL, NULL, NULL, NULL, NULL, 0, 0),
(47, 'Leos1', '2000-08-01', 'U2FsdGVkX1+cDAUfYewVzwKvqnAVSvueGtDXC9Jg6Sg=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', NULL, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0),
(48, 'leo1', '2000-08-09', 'U2FsdGVkX1/RwXiQRKrDvSVh14PfTJNQVAmxKjJGZt8=', 'elite', 0, NULL, 0, NULL, 'active', '2025-11-10 01:40:35', 'Male', '9898707012', 0, 'alvin@gmail.com', 0, NULL, 'India', 'Kerala', 'Kottayam', 'Hindu', 'Nair', 185.00, 90.00, '25519', 0, 1),
(49, 'Leos', '1999-08-09', 'U2FsdGVkX1+XN/mpEiFS+fvg35STLFsZ3LYNZScfTxM=', 'free', 0, NULL, 0, NULL, 'trial', NULL, 'Male', '9898707080', 0, 'apple@example.com', 0, NULL, 'India', 'Karnataka', 'Bangalore', 'Hindu', 'Hindu', 188.00, 85.00, '460000', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user_ai_friends`
--

CREATE TABLE `user_ai_friends` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `user_mbti_type` varchar(4) NOT NULL,
  `ai_friend_mbti_type` varchar(4) NOT NULL,
  `friend_index` int NOT NULL,
  `friendship_strength` int DEFAULT '50',
  `is_active` tinyint(1) DEFAULT '1',
  `last_interaction` timestamp NULL DEFAULT NULL,
  `total_interactions` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_ai_friends`
--

INSERT INTO `user_ai_friends` (`id`, `user_id`, `user_mbti_type`, `ai_friend_mbti_type`, `friend_index`, `friendship_strength`, `is_active`, `last_interaction`, `total_interactions`, `created_at`, `updated_at`) VALUES
(22, 20, 'INTP', 'ENFJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(23, 19, 'INTP', 'ENFJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(24, 11, 'INTP', 'ENFJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(25, 8, 'INTP', 'ENFJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(26, 20, 'INTP', 'ENTJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(27, 19, 'INTP', 'ENTJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(28, 11, 'INTP', 'ENTJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(29, 8, 'INTP', 'ENTJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(30, 20, 'INTP', 'INFJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(31, 19, 'INTP', 'INFJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(32, 11, 'INTP', 'INFJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(33, 8, 'INTP', 'INFJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(34, 20, 'INTP', 'ENFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(35, 19, 'INTP', 'ENFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(36, 11, 'INTP', 'ENFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(37, 8, 'INTP', 'ENFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(38, 20, 'INTP', 'ESTJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(39, 19, 'INTP', 'ESTJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(40, 11, 'INTP', 'ESTJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(41, 8, 'INTP', 'ESTJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(42, 35, 'ENTP', 'INFJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(43, 35, 'ENTP', 'INTJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(44, 35, 'ENTP', 'ENFJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(45, 35, 'ENTP', 'ISFJ', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(46, 35, 'ENTP', 'INFP', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(47, 24, 'INFJ', 'ENTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(48, 23, 'INFJ', 'ENTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(49, 24, 'INFJ', 'ENFP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(50, 23, 'INFJ', 'ENFP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(51, 24, 'INFJ', 'INTJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(52, 23, 'INFJ', 'INTJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(53, 24, 'INFJ', 'INFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(54, 23, 'INFJ', 'INFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(55, 24, 'INFJ', 'ENFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(56, 23, 'INFJ', 'ENFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(57, 9, 'INFP', 'ENFJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(58, 9, 'INFP', 'ENTJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(59, 9, 'INFP', 'INTJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(60, 9, 'INFP', 'ENFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(61, 9, 'INFP', 'INFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(62, 27, 'ENFJ', 'INFP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(63, 27, 'ENFJ', 'INTP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(64, 27, 'ENFJ', 'ISFP', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(65, 27, 'ENFJ', 'ENFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(66, 27, 'ENFJ', 'INFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(67, 44, 'ENFP', 'INTJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(68, 25, 'ENFP', 'INTJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(69, 44, 'ENFP', 'INFJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(70, 25, 'ENFP', 'INFJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(71, 44, 'ENFP', 'ENTJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(72, 25, 'ENFP', 'ENTJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(73, 44, 'ENFP', 'INFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(74, 25, 'ENFP', 'INFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(75, 44, 'ENFP', 'ENFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(76, 25, 'ENFP', 'ENFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(77, 41, 'ISTJ', 'ESTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(78, 34, 'ISTJ', 'ESTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(79, 31, 'ISTJ', 'ESTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(80, 29, 'ISTJ', 'ESTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(81, 10, 'ISTJ', 'ESTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(82, 41, 'ISTJ', 'ESFP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(83, 34, 'ISTJ', 'ESFP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(84, 31, 'ISTJ', 'ESFP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(85, 29, 'ISTJ', 'ESFP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(86, 10, 'ISTJ', 'ESFP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(87, 41, 'ISTJ', 'ESTJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(88, 34, 'ISTJ', 'ESTJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(89, 31, 'ISTJ', 'ESTJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(90, 29, 'ISTJ', 'ESTJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(91, 10, 'ISTJ', 'ESTJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(92, 41, 'ISTJ', 'ISFJ', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(93, 34, 'ISTJ', 'ISFJ', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(94, 31, 'ISTJ', 'ISFJ', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(95, 29, 'ISTJ', 'ISFJ', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(96, 10, 'ISTJ', 'ISFJ', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(97, 41, 'ISTJ', 'ESFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(98, 34, 'ISTJ', 'ESFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(99, 31, 'ISTJ', 'ESFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(100, 29, 'ISTJ', 'ESFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(101, 10, 'ISTJ', 'ESFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(102, 43, 'ISFJ', 'ESTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(103, 36, 'ISFJ', 'ESTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(104, 32, 'ISFJ', 'ESTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(105, 17, 'ISFJ', 'ESTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(106, 43, 'ISFJ', 'ESFP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(107, 36, 'ISFJ', 'ESFP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(108, 32, 'ISFJ', 'ESFP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(109, 17, 'ISFJ', 'ESFP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(110, 43, 'ISFJ', 'ENTP', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(111, 36, 'ISFJ', 'ENTP', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(112, 32, 'ISFJ', 'ENTP', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(113, 17, 'ISFJ', 'ENTP', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(114, 43, 'ISFJ', 'ESTJ', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(115, 36, 'ISFJ', 'ESTJ', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(116, 32, 'ISFJ', 'ESTJ', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(117, 17, 'ISFJ', 'ESTJ', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(118, 43, 'ISFJ', 'ISTJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(119, 36, 'ISFJ', 'ISTJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(120, 32, 'ISFJ', 'ISTJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(121, 17, 'ISFJ', 'ISTJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(122, 26, 'ESTJ', 'ISTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(123, 26, 'ESTJ', 'INTP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(124, 26, 'ESTJ', 'ISFP', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(125, 26, 'ESTJ', 'ISTJ', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(126, 26, 'ESTJ', 'ESFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(127, 40, 'ESFJ', 'ISTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(128, 33, 'ESFJ', 'ISTP', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(129, 40, 'ESFJ', 'ISFP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(130, 33, 'ESFJ', 'ISFP', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(131, 40, 'ESFJ', 'ISTJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(132, 33, 'ESFJ', 'ISTJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(133, 40, 'ESFJ', 'ESTJ', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(134, 33, 'ESFJ', 'ESTJ', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(135, 40, 'ESFJ', 'ISFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(136, 33, 'ESFJ', 'ISFJ', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(137, 28, 'ISTP', 'ESTJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(138, 22, 'ISTP', 'ESTJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(139, 28, 'ISTP', 'ESFJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(140, 22, 'ISTP', 'ESFJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(141, 28, 'ISTP', 'ESTP', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(142, 22, 'ISTP', 'ESTP', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(143, 28, 'ISTP', 'ISFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(144, 22, 'ISTP', 'ISFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(145, 28, 'ISTP', 'ESFP', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(146, 22, 'ISTP', 'ESFP', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(147, 39, 'ISFP', 'ENFJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(148, 18, 'ISFP', 'ENFJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(149, 16, 'ISFP', 'ENFJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(150, 39, 'ISFP', 'ESTJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(151, 18, 'ISFP', 'ESTJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(152, 16, 'ISFP', 'ESTJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(153, 39, 'ISFP', 'ESFJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(154, 18, 'ISFP', 'ESFJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(155, 16, 'ISFP', 'ESFJ', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(156, 39, 'ISFP', 'ISTP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(157, 18, 'ISFP', 'ISTP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(158, 16, 'ISFP', 'ISTP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(159, 39, 'ISFP', 'ESFP', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(160, 18, 'ISFP', 'ESFP', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(161, 16, 'ISFP', 'ESFP', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(162, 37, 'ESTP', 'ISFJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(163, 7, 'ESTP', 'ISFJ', 1, 95, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(164, 37, 'ESTP', 'ISTJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(165, 7, 'ESTP', 'ISTJ', 2, 90, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(166, 37, 'ESTP', 'ISTP', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(167, 7, 'ESTP', 'ISTP', 3, 85, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(168, 37, 'ESTP', 'ESFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(169, 7, 'ESTP', 'ESFP', 4, 80, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(170, 37, 'ESTP', 'ISFP', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(171, 7, 'ESTP', 'ISFP', 5, 75, 1, NULL, 0, '2025-08-05 03:39:14', '2025-08-05 03:39:14'),
(277, 2, 'ENFJ', 'ESFP', 1, 61, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(278, 2, 'ENFJ', 'ISTJ', 3, 51, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(279, 2, 'ENFJ', 'ENFP', 4, 98, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(280, 2, 'ENFJ', 'ISFJ', 5, 95, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(281, 2, 'ENFJ', 'ISTP', 2, 71, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(282, 4, 'ENFJ', 'INFJ', 2, 86, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(283, 4, 'ENFJ', 'ESFP', 5, 78, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(284, 4, 'ENFJ', 'ISFJ', 4, 59, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(285, 4, 'ENFJ', 'ISTP', 1, 99, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(286, 4, 'ENFJ', 'ENFJ', 3, 50, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(287, 5, 'ENFJ', 'INFP', 3, 53, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(288, 5, 'ENFJ', 'INFJ', 4, 74, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(289, 5, 'ENFJ', 'ISFP', 5, 93, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(290, 5, 'ENFJ', 'INTP', 1, 73, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(291, 5, 'ENFJ', 'INTJ', 2, 58, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(292, 6, 'ENFJ', 'ESFP', 1, 63, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(293, 6, 'ENFJ', 'ISTJ', 4, 58, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(294, 6, 'ENFJ', 'ENTP', 3, 73, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(295, 6, 'ENFJ', 'ESTJ', 5, 99, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(296, 6, 'ENFJ', 'ESFJ', 2, 84, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(297, 12, 'ENFJ', 'INFP', 2, 57, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(298, 12, 'ENFJ', 'INFJ', 3, 58, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(299, 12, 'ENFJ', 'ESTP', 4, 87, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(300, 12, 'ENFJ', 'ISTJ', 5, 67, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(301, 12, 'ENFJ', 'ISFJ', 1, 99, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(302, 13, 'ENFJ', 'ISFP', 3, 50, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(303, 13, 'ENFJ', 'INFP', 1, 76, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(304, 13, 'ENFJ', 'ENTP', 5, 81, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(305, 13, 'ENFJ', 'INTP', 4, 91, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(306, 13, 'ENFJ', 'ISTJ', 2, 71, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(307, 14, 'ENFJ', 'ESFP', 2, 63, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(308, 14, 'ENFJ', 'ISFP', 3, 79, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(309, 14, 'ENFJ', 'ENFP', 1, 53, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(310, 14, 'ENFJ', 'ENTP', 4, 58, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(311, 14, 'ENFJ', 'INTJ', 5, 84, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(312, 15, 'ENFJ', 'ENTP', 3, 94, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(313, 15, 'ENFJ', 'ESTJ', 1, 72, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(314, 15, 'ENFJ', 'ESFP', 2, 88, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(315, 15, 'ENFJ', 'INFP', 4, 85, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(316, 15, 'ENFJ', 'INFJ', 5, 76, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(317, 21, 'ENFJ', 'ESFP', 5, 63, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(318, 21, 'ENFJ', 'ENTP', 2, 95, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(319, 21, 'ENFJ', 'ENFP', 3, 90, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(320, 21, 'ENFJ', 'INTP', 1, 55, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(321, 21, 'ENFJ', 'ISFP', 4, 65, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(322, 30, '', 'ESFP', 5, 53, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(323, 30, '', 'ESTJ', 4, 66, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(324, 30, '', 'INFJ', 2, 58, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(325, 30, '', 'ESTP', 3, 50, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(326, 30, '', 'ESFJ', 1, 72, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(327, 38, 'ENFJ', 'ISFJ', 3, 93, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(328, 38, 'ENFJ', 'ESTP', 2, 97, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(329, 38, 'ENFJ', 'ESFJ', 5, 60, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(330, 38, 'ENFJ', 'INTP', 4, 57, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(331, 38, 'ENFJ', 'ENTP', 1, 64, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(332, 42, 'ENFJ', 'INTP', 4, 59, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(333, 42, 'ENFJ', 'ESTP', 1, 70, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(334, 42, 'ENFJ', 'INFP', 5, 51, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(335, 42, 'ENFJ', 'ISFP', 3, 61, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(336, 42, 'ENFJ', 'ESFP', 2, 93, 1, NULL, 0, '2025-08-06 09:43:40', '2025-08-06 09:43:40'),
(338, 45, 'ISFJ', 'ESTP', 1, 95, 1, NULL, 0, '2025-08-08 05:21:58', '2025-08-08 05:21:58'),
(339, 45, 'ISFJ', 'ESFP', 2, 85, 1, NULL, 0, '2025-08-08 05:21:58', '2025-08-08 05:21:58'),
(340, 45, 'ISFJ', 'ENTP', 3, 80, 1, NULL, 0, '2025-08-08 05:21:58', '2025-08-08 05:21:58'),
(341, 45, 'ISFJ', 'ESTJ', 4, 85, 1, NULL, 0, '2025-08-08 05:21:58', '2025-08-08 05:21:58'),
(342, 45, 'ISFJ', 'ISTJ', 5, 75, 1, NULL, 0, '2025-08-08 05:21:58', '2025-08-08 05:21:58'),
(343, 48, 'INTP', 'ENFJ', 1, 95, 1, NULL, 0, '2025-08-09 01:28:56', '2025-08-09 01:28:56'),
(344, 48, 'INTP', 'ENTJ', 2, 85, 1, NULL, 0, '2025-08-09 01:28:56', '2025-08-09 01:28:56'),
(345, 48, 'INTP', 'INFJ', 3, 85, 1, NULL, 0, '2025-08-09 01:28:56', '2025-08-09 01:28:56'),
(346, 48, 'INTP', 'ENFP', 4, 85, 1, NULL, 0, '2025-08-09 01:28:56', '2025-08-09 01:28:56'),
(347, 48, 'INTP', 'ESTJ', 5, 70, 1, NULL, 0, '2025-08-09 01:28:56', '2025-08-09 01:28:56'),
(348, 47, 'ISTP', 'ESTJ', 1, 85, 1, NULL, 0, '2025-08-11 05:14:15', '2025-08-11 05:14:15'),
(349, 47, 'ISTP', 'ESFJ', 2, 95, 1, NULL, 0, '2025-08-11 05:14:15', '2025-08-11 05:14:15'),
(350, 47, 'ISTP', 'ESTP', 3, 75, 1, NULL, 0, '2025-08-11 05:14:15', '2025-08-11 05:14:15'),
(351, 47, 'ISTP', 'ISFP', 4, 75, 1, NULL, 0, '2025-08-11 05:14:15', '2025-08-11 05:14:15'),
(352, 47, 'ISTP', 'ESFP', 5, 85, 1, NULL, 0, '2025-08-11 05:14:15', '2025-08-11 05:14:15'),
(353, 49, 'ENTP', 'INFJ', 1, 95, 1, NULL, 0, '2025-08-23 04:54:43', '2025-08-23 04:54:43'),
(354, 49, 'ENTP', 'INTJ', 2, 85, 1, NULL, 0, '2025-08-23 04:54:43', '2025-08-23 04:54:43'),
(355, 49, 'ENTP', 'ENFJ', 3, 85, 1, NULL, 0, '2025-08-23 04:54:43', '2025-08-23 04:54:43'),
(356, 49, 'ENTP', 'ISFJ', 4, 80, 1, NULL, 0, '2025-08-23 04:54:43', '2025-08-23 04:54:43'),
(357, 49, 'ENTP', 'INFP', 5, 85, 1, NULL, 0, '2025-08-23 04:54:43', '2025-08-23 04:54:43'),
(358, 46, 'ISFP', 'ENFJ', 1, 70, 1, NULL, 0, '2025-08-23 13:55:45', '2025-08-23 13:55:45'),
(359, 46, 'ISFP', 'ESTJ', 2, 95, 1, NULL, 0, '2025-08-23 13:55:45', '2025-08-23 13:55:45'),
(360, 46, 'ISFP', 'ESFJ', 3, 85, 1, NULL, 0, '2025-08-23 13:55:45', '2025-08-23 13:55:45'),
(361, 46, 'ISFP', 'ISTP', 4, 75, 1, NULL, 0, '2025-08-23 13:55:45', '2025-08-23 13:55:45'),
(362, 46, 'ISFP', 'ESFP', 5, 75, 1, NULL, 0, '2025-08-23 13:55:45', '2025-08-23 13:55:45');

-- --------------------------------------------------------

--
-- Table structure for table `user_ai_preferences`
--

CREATE TABLE `user_ai_preferences` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `ai_character_id` int DEFAULT NULL,
  `preference_key` varchar(100) NOT NULL,
  `preference_value` json NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_badges`
--

CREATE TABLE `user_badges` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `badge_type` enum('verified','top_tier','premium','elite') COLLATE utf8mb4_unicode_ci NOT NULL,
  `badge_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `badge_description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `awarded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_badges`
--

INSERT INTO `user_badges` (`id`, `user_id`, `badge_type`, `badge_name`, `badge_description`, `is_active`, `awarded_at`, `expires_at`) VALUES
(2, 48, 'elite', 'Elite Member', 'Premium member with exclusive benefits', 1, '2025-08-10 01:43:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_chat_settings`
--

CREATE TABLE `user_chat_settings` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `notification_enabled` tinyint(1) DEFAULT '1',
  `sound_enabled` tinyint(1) DEFAULT '1',
  `muted_until` timestamp NULL DEFAULT NULL,
  `theme` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'light',
  `message_preview_enabled` tinyint(1) DEFAULT '1',
  `read_receipts_enabled` tinyint(1) DEFAULT '1',
  `typing_indicators_enabled` tinyint(1) DEFAULT '1',
  `last_active_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `user_current_plan_details`
-- (See below for the actual view)
--
CREATE TABLE `user_current_plan_details` (
`user_id` int
,`username` varchar(255)
,`current_plan` enum('free','pro','elite')
,`subscription_status` enum('active','expired','trial')
,`subscription_ends` timestamp
,`is_verified` tinyint(1)
,`profile_boost_active` tinyint(1)
,`profile_boost_ends` timestamp
,`plan_features` json
,`plan_display_name` varchar(100)
);

-- --------------------------------------------------------

--
-- Table structure for table `user_details`
--

CREATE TABLE `user_details` (
  `id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `dob` date NOT NULL,
  `gender` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `education` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `religion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `height` int NOT NULL,
  `weight` int NOT NULL,
  `university` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `citizenship` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_details`
--

INSERT INTO `user_details` (`id`, `name`, `dob`, `gender`, `location`, `education`, `religion`, `height`, `weight`, `university`, `citizenship`) VALUES
(1, 'Avni Goyal', '2014-09-17', 'Female', 'Dehradun, India', 'BTech CSE', 'Hindu', 144, 65, 'UPES Dehradun', 'Indian');

-- --------------------------------------------------------

--
-- Table structure for table `user_education`
--

CREATE TABLE `user_education` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `education_level_id` int NOT NULL,
  `degree` varchar(255) NOT NULL,
  `graduation_year` year DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_education`
--

INSERT INTO `user_education` (`id`, `user_id`, `education_level_id`, `degree`, `graduation_year`) VALUES
(5, 31, 5, 'B.E', '2020');

-- --------------------------------------------------------

--
-- Table structure for table `user_interests`
--

CREATE TABLE `user_interests` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `interest_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_job`
--

CREATE TABLE `user_job` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `job_title_id` int NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_job`
--

INSERT INTO `user_job` (`id`, `user_id`, `job_title_id`, `company`, `location`) VALUES
(2, 31, 1, 'Doutya', 'TN');

-- --------------------------------------------------------

--
-- Table structure for table `user_languages`
--

CREATE TABLE `user_languages` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `language_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_languages`
--

INSERT INTO `user_languages` (`id`, `user_id`, `language_id`, `created_at`) VALUES
(1, 1, 1, '2024-09-23 07:55:55'),
(2, 1, 2, '2024-09-23 07:56:20'),
(7, 31, 10, '2025-04-19 13:11:43'),
(8, 31, 5, '2025-04-19 13:11:43');

-- --------------------------------------------------------

--
-- Table structure for table `user_matching_multi_preferences`
--

CREATE TABLE `user_matching_multi_preferences` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `option_id` int NOT NULL,
  `importance` enum('must_have','important','nice_to_have','not_important') DEFAULT 'nice_to_have',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_matching_preferences`
--

CREATE TABLE `user_matching_preferences` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `importance` enum('must_have','important','nice_to_have','not_important') DEFAULT 'nice_to_have',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_mbti_assessment`
--

CREATE TABLE `user_mbti_assessment` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `mbti_type` varchar(4) NOT NULL,
  `extraversion_score` int NOT NULL,
  `sensing_score` int NOT NULL,
  `thinking_score` int NOT NULL,
  `judging_score` int NOT NULL,
  `assessment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `confidence_level` enum('low','medium','high') DEFAULT 'medium',
  `assessment_version` varchar(10) DEFAULT '1.0',
  `trait_descriptions` json DEFAULT NULL,
  `strengths_weaknesses` json DEFAULT NULL,
  `career_suggestions` json DEFAULT NULL,
  `relationship_insights` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_multi_preferences`
--

CREATE TABLE `user_multi_preferences` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `option_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_occupation`
--

CREATE TABLE `user_occupation` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `place` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `empt_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `emp_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `emp_nature` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `annual_income` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_occupation`
--

INSERT INTO `user_occupation` (`id`, `user_id`, `place`, `empt_type`, `emp_name`, `emp_nature`, `annual_income`) VALUES
(1, 1, 'Noida, UP', 'Software Developer', 'Oracle', 'Regular', 20);

-- --------------------------------------------------------

--
-- Table structure for table `user_preferences`
--

CREATE TABLE `user_preferences` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `option_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_preferences`
--

INSERT INTO `user_preferences` (`id`, `user_id`, `category_id`, `option_id`, `created_at`, `updated_at`) VALUES
(2, 40, 1, 1, '2025-04-28 23:44:30', '2025-04-28 23:45:24'),
(3, 40, 2, 7, '2025-04-28 23:44:31', '2025-04-28 23:45:25'),
(4, 40, 3, 9, '2025-04-28 23:44:32', '2025-04-28 23:45:26'),
(5, 40, 4, 13, '2025-04-28 23:44:33', '2025-04-28 23:45:28'),
(6, 40, 5, 18, '2025-04-28 23:44:34', '2025-04-28 23:45:29'),
(7, 40, 6, 26, '2025-04-28 23:44:35', '2025-04-28 23:45:30'),
(8, 40, 7, 33, '2025-04-28 23:44:36', '2025-04-28 23:45:31'),
(9, 40, 8, 34, '2025-04-28 23:44:37', '2025-04-28 23:45:32'),
(10, 40, 9, 39, '2025-04-28 23:44:39', '2025-04-28 23:45:33'),
(11, 40, 10, 45, '2025-04-28 23:44:40', '2025-04-28 23:45:35'),
(12, 40, 11, 55, '2025-04-28 23:44:41', '2025-04-28 23:45:36'),
(13, 40, 12, 65, '2025-04-28 23:44:42', '2025-04-28 23:45:37'),
(14, 40, 13, 73, '2025-04-28 23:44:43', '2025-04-28 23:45:38'),
(15, 40, 15, 78, '2025-04-28 23:44:44', '2025-04-28 23:45:39'),
(16, 40, 16, 88, '2025-04-28 23:44:45', '2025-04-28 23:45:40'),
(17, 42, 1, 1, '2025-08-03 02:58:42', '2025-08-03 02:58:42'),
(18, 42, 2, 7, '2025-08-03 02:58:42', '2025-08-03 02:58:42'),
(19, 42, 3, 9, '2025-08-03 02:58:42', '2025-08-03 02:58:42'),
(20, 42, 4, 14, '2025-08-03 02:58:43', '2025-08-03 02:58:43'),
(21, 42, 5, 16, '2025-08-03 02:58:43', '2025-08-03 02:58:43'),
(22, 42, 6, 26, '2025-08-03 02:58:43', '2025-08-03 02:58:43'),
(23, 42, 7, 33, '2025-08-03 02:58:43', '2025-08-03 02:58:43'),
(24, 42, 8, 38, '2025-08-03 02:58:44', '2025-08-03 02:58:44'),
(25, 42, 9, 40, '2025-08-03 02:58:44', '2025-08-03 02:58:44'),
(26, 42, 10, 46, '2025-08-03 02:58:44', '2025-08-03 02:58:44'),
(27, 42, 11, 56, '2025-08-03 02:58:45', '2025-08-03 02:58:45'),
(28, 42, 12, 65, '2025-08-03 02:58:45', '2025-08-03 02:58:45'),
(29, 42, 13, 75, '2025-08-03 02:58:45', '2025-08-03 02:58:45'),
(30, 42, 15, 81, '2025-08-03 02:58:45', '2025-08-03 02:58:45'),
(31, 42, 16, 90, '2025-08-03 02:58:46', '2025-08-03 02:58:46'),
(32, 43, 1, 1, '2025-08-04 13:08:13', '2025-08-04 13:08:13'),
(33, 43, 2, 7, '2025-08-04 13:08:13', '2025-08-04 13:08:13'),
(34, 43, 3, 11, '2025-08-04 13:08:14', '2025-08-04 13:08:14'),
(35, 43, 4, 14, '2025-08-04 13:08:14', '2025-08-04 13:08:14'),
(36, 43, 5, 20, '2025-08-04 13:08:14', '2025-08-04 13:08:14'),
(37, 43, 6, 26, '2025-08-04 13:08:15', '2025-08-04 13:08:15'),
(38, 43, 7, 31, '2025-08-04 13:08:15', '2025-08-04 13:08:15'),
(39, 43, 8, 36, '2025-08-04 13:08:16', '2025-08-04 13:08:16'),
(40, 43, 9, 39, '2025-08-04 13:08:16', '2025-08-04 13:08:16'),
(41, 43, 10, 45, '2025-08-04 13:08:16', '2025-08-04 13:08:16'),
(42, 43, 11, 60, '2025-08-04 13:08:17', '2025-08-04 13:08:17'),
(43, 43, 12, 71, '2025-08-04 13:08:17', '2025-08-04 13:08:17'),
(44, 43, 13, 74, '2025-08-04 13:08:18', '2025-08-04 13:08:18'),
(45, 43, 15, 79, '2025-08-04 13:08:18', '2025-08-04 13:08:18'),
(46, 43, 16, 88, '2025-08-04 13:08:19', '2025-08-04 13:08:19'),
(47, 44, 1, 1, '2025-08-04 13:14:47', '2025-08-04 13:14:47'),
(48, 44, 2, 7, '2025-08-04 13:14:47', '2025-08-04 13:14:47'),
(49, 44, 3, 10, '2025-08-04 13:14:47', '2025-08-04 13:14:47'),
(50, 44, 4, 14, '2025-08-04 13:14:47', '2025-08-04 13:14:47'),
(51, 44, 5, 16, '2025-08-04 13:14:48', '2025-08-04 13:14:48'),
(52, 44, 6, 26, '2025-08-04 13:14:48', '2025-08-04 13:14:48'),
(53, 44, 7, 32, '2025-08-04 13:14:48', '2025-08-04 13:14:48'),
(54, 44, 8, 35, '2025-08-04 13:14:49', '2025-08-04 13:14:49'),
(55, 44, 9, 40, '2025-08-04 13:14:49', '2025-08-04 13:14:49'),
(56, 44, 10, 44, '2025-08-04 13:14:49', '2025-08-04 13:14:49'),
(57, 44, 11, 55, '2025-08-04 13:14:50', '2025-08-04 13:14:50'),
(58, 44, 12, 69, '2025-08-04 13:14:50', '2025-08-04 13:14:50'),
(59, 44, 13, 75, '2025-08-04 13:14:50', '2025-08-04 13:14:50'),
(60, 44, 15, 79, '2025-08-04 13:14:51', '2025-08-04 13:14:51'),
(61, 44, 16, 88, '2025-08-04 13:14:51', '2025-08-04 13:14:51'),
(62, 2, 1, 3, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(63, 2, 2, 7, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(64, 2, 3, 11, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(65, 2, 5, 23, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(66, 2, 6, 28, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(67, 2, 7, 29, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(68, 2, 8, 38, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(69, 2, 9, 41, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(70, 2, 10, 51, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(71, 2, 11, 56, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(72, 2, 12, 67, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(73, 2, 15, 83, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(74, 2, 16, 90, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(75, 4, 1, 3, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(76, 4, 3, 9, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(77, 4, 5, 20, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(78, 4, 7, 29, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(79, 4, 8, 36, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(80, 4, 9, 39, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(81, 4, 10, 51, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(82, 4, 11, 58, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(83, 4, 12, 62, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(84, 4, 13, 74, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(85, 4, 15, 83, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(86, 4, 16, 89, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(87, 5, 1, 5, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(88, 5, 3, 11, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(89, 5, 4, 15, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(90, 5, 5, 21, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(91, 5, 7, 31, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(92, 5, 8, 38, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(93, 5, 9, 42, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(94, 5, 10, 52, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(95, 5, 11, 56, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(96, 5, 12, 69, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(97, 5, 13, 76, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(98, 5, 15, 84, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(99, 5, 16, 86, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(100, 6, 1, 4, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(101, 6, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(102, 6, 3, 9, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(103, 6, 4, 13, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(104, 6, 5, 20, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(105, 6, 6, 26, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(106, 6, 7, 29, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(107, 6, 8, 38, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(108, 6, 11, 59, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(109, 6, 12, 65, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(110, 6, 13, 75, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(111, 6, 15, 78, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(112, 6, 16, 86, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(113, 7, 1, 5, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(114, 7, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(115, 7, 3, 12, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(116, 7, 4, 15, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(117, 7, 5, 22, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(118, 7, 6, 28, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(119, 7, 7, 31, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(120, 7, 8, 34, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(121, 7, 9, 42, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(122, 7, 10, 47, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(123, 7, 11, 55, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(124, 7, 12, 69, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(125, 7, 13, 73, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(126, 7, 15, 80, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(127, 7, 16, 87, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(128, 8, 1, 5, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(129, 8, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(130, 8, 3, 12, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(131, 8, 4, 13, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(132, 8, 5, 22, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(133, 8, 7, 32, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(134, 8, 8, 35, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(135, 8, 9, 40, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(136, 8, 10, 44, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(137, 8, 11, 60, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(138, 8, 12, 69, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(139, 8, 13, 75, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(140, 8, 15, 82, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(141, 8, 16, 90, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(142, 9, 1, 5, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(143, 9, 2, 8, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(144, 9, 3, 10, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(145, 9, 4, 15, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(146, 9, 5, 22, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(147, 9, 6, 24, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(148, 9, 7, 29, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(149, 9, 8, 35, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(150, 9, 9, 42, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(151, 9, 10, 50, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(152, 9, 11, 58, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(153, 9, 12, 63, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(154, 9, 13, 74, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(155, 9, 15, 82, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(156, 9, 16, 87, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(157, 10, 1, 4, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(158, 10, 2, 8, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(159, 10, 3, 11, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(160, 10, 5, 19, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(161, 10, 6, 24, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(162, 10, 7, 33, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(163, 10, 8, 35, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(164, 10, 9, 41, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(165, 10, 10, 46, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(166, 10, 11, 60, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(167, 10, 12, 64, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(168, 10, 13, 74, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(169, 10, 15, 79, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(170, 10, 16, 86, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(171, 11, 1, 5, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(172, 11, 2, 8, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(173, 11, 3, 11, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(174, 11, 4, 13, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(175, 11, 5, 16, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(176, 11, 7, 29, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(177, 11, 8, 35, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(178, 11, 9, 41, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(179, 11, 10, 47, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(180, 11, 11, 59, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(181, 11, 12, 62, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(182, 11, 15, 81, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(183, 11, 16, 89, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(184, 12, 1, 1, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(185, 12, 2, 8, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(186, 12, 3, 11, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(187, 12, 4, 14, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(188, 12, 5, 18, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(189, 12, 6, 26, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(190, 12, 7, 29, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(191, 12, 8, 34, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(192, 12, 9, 39, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(193, 12, 10, 51, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(194, 12, 11, 56, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(195, 12, 12, 66, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(196, 12, 13, 74, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(197, 12, 15, 81, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(198, 12, 16, 89, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(199, 13, 1, 5, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(200, 13, 2, 7, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(201, 13, 3, 10, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(202, 13, 4, 13, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(203, 13, 5, 22, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(204, 13, 6, 26, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(205, 13, 7, 30, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(206, 13, 8, 34, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(207, 13, 9, 42, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(208, 13, 10, 50, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(209, 13, 11, 53, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(210, 13, 12, 70, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(211, 13, 13, 74, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(212, 13, 15, 82, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(213, 13, 16, 88, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(214, 14, 1, 5, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(215, 14, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(216, 14, 3, 12, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(217, 14, 4, 13, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(218, 14, 5, 19, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(219, 14, 6, 28, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(220, 14, 7, 30, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(221, 14, 8, 35, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(222, 14, 9, 40, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(223, 14, 10, 49, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(224, 14, 11, 55, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(225, 14, 12, 67, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(226, 14, 13, 75, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(227, 14, 15, 79, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(228, 14, 16, 89, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(229, 15, 1, 3, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(230, 15, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(231, 15, 3, 12, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(232, 15, 4, 13, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(233, 15, 5, 22, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(234, 15, 6, 28, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(235, 15, 7, 31, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(236, 15, 8, 34, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(237, 15, 9, 42, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(238, 15, 10, 52, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(239, 15, 11, 54, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(240, 15, 12, 65, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(241, 15, 13, 76, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(242, 15, 15, 81, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(243, 15, 16, 87, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(244, 16, 1, 4, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(245, 16, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(246, 16, 3, 10, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(247, 16, 4, 14, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(248, 16, 5, 19, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(249, 16, 6, 25, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(250, 16, 7, 31, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(251, 16, 8, 34, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(252, 16, 9, 39, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(253, 16, 10, 43, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(254, 16, 11, 53, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(255, 16, 12, 62, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(256, 16, 13, 76, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(257, 16, 15, 83, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(258, 16, 16, 88, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(259, 17, 1, 1, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(260, 17, 2, 7, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(261, 17, 3, 12, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(262, 17, 5, 22, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(263, 17, 6, 26, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(264, 17, 7, 29, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(265, 17, 8, 35, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(266, 17, 9, 41, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(267, 17, 10, 48, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(268, 17, 11, 58, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(269, 17, 12, 69, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(270, 17, 13, 75, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(271, 17, 15, 80, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(272, 17, 16, 87, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(273, 18, 1, 1, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(274, 18, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(275, 18, 3, 11, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(276, 18, 4, 13, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(277, 18, 5, 21, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(278, 18, 6, 28, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(279, 18, 7, 32, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(280, 18, 9, 39, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(281, 18, 10, 44, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(282, 18, 11, 57, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(283, 18, 12, 61, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(284, 18, 13, 74, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(285, 18, 15, 83, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(286, 18, 16, 85, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(287, 19, 1, 5, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(288, 19, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(289, 19, 3, 11, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(290, 19, 4, 13, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(291, 19, 5, 16, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(292, 19, 6, 24, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(293, 19, 7, 32, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(294, 19, 8, 37, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(295, 19, 9, 41, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(296, 19, 10, 44, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(297, 19, 11, 57, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(298, 19, 12, 66, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(299, 19, 13, 76, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(300, 19, 15, 79, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(301, 19, 16, 85, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(302, 20, 1, 2, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(303, 20, 5, 22, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(304, 20, 6, 27, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(305, 20, 7, 32, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(306, 20, 8, 35, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(307, 20, 9, 40, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(308, 20, 10, 43, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(309, 20, 11, 58, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(310, 20, 12, 68, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(311, 20, 13, 74, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(312, 20, 15, 83, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(313, 20, 16, 88, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(314, 21, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(315, 21, 4, 15, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(316, 21, 5, 18, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(317, 21, 6, 24, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(318, 21, 8, 36, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(319, 21, 9, 40, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(320, 21, 10, 46, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(321, 21, 11, 60, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(322, 21, 12, 70, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(323, 21, 13, 75, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(324, 21, 15, 80, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(325, 21, 16, 88, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(326, 22, 1, 5, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(327, 22, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(328, 22, 3, 12, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(329, 22, 4, 13, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(330, 22, 5, 17, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(331, 22, 6, 24, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(332, 22, 7, 31, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(333, 22, 8, 34, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(334, 22, 9, 42, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(335, 22, 10, 45, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(336, 22, 11, 55, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(337, 22, 12, 68, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(338, 22, 13, 75, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(339, 22, 15, 78, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(340, 22, 16, 87, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(341, 23, 1, 1, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(342, 23, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(343, 23, 3, 12, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(344, 23, 4, 13, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(345, 23, 5, 16, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(346, 23, 6, 24, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(347, 23, 7, 30, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(348, 23, 8, 34, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(349, 23, 9, 39, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(350, 23, 10, 52, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(351, 23, 11, 57, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(352, 23, 12, 61, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(353, 23, 13, 75, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(354, 23, 15, 79, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(355, 23, 16, 85, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(356, 24, 1, 1, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(357, 24, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(358, 24, 3, 12, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(359, 24, 4, 13, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(360, 24, 5, 18, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(361, 24, 6, 24, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(362, 24, 7, 32, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(363, 24, 8, 34, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(364, 24, 9, 42, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(365, 24, 10, 51, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(366, 24, 11, 59, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(367, 24, 12, 68, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(368, 24, 13, 77, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(369, 24, 15, 78, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(370, 24, 16, 89, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(371, 25, 1, 5, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(372, 25, 3, 9, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(373, 25, 4, 14, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(374, 25, 5, 21, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(375, 25, 6, 25, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(376, 25, 8, 38, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(377, 25, 9, 40, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(378, 25, 10, 50, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(379, 25, 11, 57, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(380, 25, 12, 64, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(381, 25, 13, 74, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(382, 25, 15, 84, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(383, 25, 16, 85, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(384, 26, 1, 2, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(385, 26, 3, 10, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(386, 26, 5, 21, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(387, 26, 6, 24, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(388, 26, 7, 29, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(389, 26, 8, 35, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(390, 26, 9, 40, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(391, 26, 10, 52, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(392, 26, 11, 57, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(393, 26, 12, 61, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(394, 26, 13, 74, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(395, 26, 15, 78, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(396, 26, 16, 86, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(397, 27, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(398, 27, 3, 9, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(399, 27, 4, 14, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(400, 27, 5, 18, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(401, 27, 6, 25, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(402, 27, 7, 30, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(403, 27, 8, 34, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(404, 27, 9, 42, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(405, 27, 10, 45, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(406, 27, 11, 56, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(407, 27, 12, 69, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(408, 27, 13, 77, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(409, 27, 15, 79, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(410, 27, 16, 86, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(411, 28, 1, 1, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(412, 28, 3, 10, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(413, 28, 4, 15, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(414, 28, 6, 25, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(415, 28, 7, 29, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(416, 28, 9, 41, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(417, 28, 10, 52, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(418, 28, 11, 57, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(419, 28, 12, 71, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(420, 28, 13, 76, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(421, 28, 15, 82, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(422, 28, 16, 87, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(423, 29, 1, 3, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(424, 29, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(425, 29, 3, 10, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(426, 29, 4, 14, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(427, 29, 5, 20, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(428, 29, 6, 27, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(429, 29, 7, 32, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(430, 29, 8, 35, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(431, 29, 9, 42, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(432, 29, 10, 45, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(433, 29, 11, 59, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(434, 29, 12, 64, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(435, 29, 13, 77, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(436, 29, 15, 83, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(437, 29, 16, 85, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(438, 30, 1, 1, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(439, 30, 2, 7, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(440, 30, 3, 10, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(441, 30, 5, 18, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(442, 30, 6, 27, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(443, 30, 7, 29, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(444, 30, 9, 39, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(445, 30, 10, 50, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(446, 30, 11, 59, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(447, 30, 12, 66, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(448, 30, 13, 76, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(449, 30, 15, 83, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(450, 30, 16, 85, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(451, 31, 1, 2, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(452, 31, 3, 12, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(453, 31, 4, 13, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(454, 31, 5, 22, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(455, 31, 6, 28, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(456, 31, 7, 31, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(457, 31, 8, 35, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(458, 31, 9, 40, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(459, 31, 10, 51, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(460, 31, 11, 55, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(461, 31, 12, 62, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(462, 31, 13, 73, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(463, 31, 15, 79, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(464, 31, 16, 90, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(465, 32, 1, 1, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(466, 32, 2, 8, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(467, 32, 3, 9, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(468, 32, 5, 17, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(469, 32, 6, 27, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(470, 32, 7, 31, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(471, 32, 8, 37, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(472, 32, 10, 47, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(473, 32, 11, 55, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(474, 32, 12, 68, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(475, 32, 13, 76, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(476, 32, 15, 78, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(477, 32, 16, 88, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(478, 33, 1, 4, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(479, 33, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(480, 33, 3, 11, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(481, 33, 4, 15, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(482, 33, 5, 19, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(483, 33, 6, 27, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(484, 33, 7, 30, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(485, 33, 8, 38, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(486, 33, 10, 47, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(487, 33, 11, 53, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(488, 33, 12, 70, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(489, 33, 13, 76, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(490, 33, 15, 84, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(491, 33, 16, 89, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(492, 34, 1, 1, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(493, 34, 3, 11, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(494, 34, 5, 20, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(495, 34, 6, 26, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(496, 34, 7, 31, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(497, 34, 8, 35, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(498, 34, 10, 52, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(499, 34, 11, 54, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(500, 34, 12, 62, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(501, 34, 13, 77, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(502, 34, 15, 80, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(503, 34, 16, 85, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(504, 35, 1, 5, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(505, 35, 3, 12, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(506, 35, 4, 15, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(507, 35, 5, 22, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(508, 35, 8, 38, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(509, 35, 9, 42, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(510, 35, 10, 49, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(511, 35, 11, 57, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(512, 35, 12, 67, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(513, 35, 13, 77, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(514, 35, 15, 83, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(515, 35, 16, 89, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(516, 36, 1, 1, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(517, 36, 2, 8, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(518, 36, 3, 9, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(519, 36, 4, 14, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(520, 36, 5, 22, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(521, 36, 6, 26, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(522, 36, 7, 33, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(523, 36, 8, 37, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(524, 36, 9, 40, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(525, 36, 10, 51, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(526, 36, 11, 54, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(527, 36, 12, 63, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(528, 36, 13, 77, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(529, 36, 15, 78, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(530, 36, 16, 88, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(531, 37, 1, 5, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(532, 37, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(533, 37, 3, 10, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(534, 37, 4, 13, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(535, 37, 5, 20, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(536, 37, 6, 25, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(537, 37, 7, 31, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(538, 37, 8, 34, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(539, 37, 9, 40, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(540, 37, 10, 46, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(541, 37, 11, 53, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(542, 37, 12, 67, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(543, 37, 13, 76, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(544, 37, 15, 83, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(545, 37, 16, 90, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(546, 38, 1, 4, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(547, 38, 2, 6, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(548, 38, 3, 9, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(549, 38, 4, 15, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(550, 38, 5, 18, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(551, 38, 6, 24, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(552, 38, 7, 30, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(553, 38, 8, 34, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(554, 38, 9, 39, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(555, 38, 10, 47, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(556, 38, 11, 53, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(557, 38, 12, 71, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(558, 38, 13, 73, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(559, 38, 15, 80, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(560, 38, 16, 89, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(561, 39, 1, 2, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(562, 39, 2, 7, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(563, 39, 3, 12, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(564, 39, 4, 15, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(565, 39, 6, 27, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(566, 39, 7, 29, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(567, 39, 8, 34, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(568, 39, 9, 39, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(569, 39, 10, 48, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(570, 39, 11, 57, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(571, 39, 12, 72, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(572, 39, 13, 74, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(573, 39, 15, 81, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(574, 39, 16, 86, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(575, 41, 1, 1, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(576, 41, 2, 7, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(577, 41, 4, 14, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(578, 41, 5, 21, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(579, 41, 6, 27, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(580, 41, 7, 30, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(581, 41, 8, 34, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(582, 41, 9, 40, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(583, 41, 10, 44, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(584, 41, 11, 56, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(585, 41, 12, 71, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(586, 41, 13, 77, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(587, 41, 15, 80, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(588, 41, 16, 88, '2025-08-06 09:39:51', '2025-08-06 09:39:51'),
(590, 45, 1, 1, '2025-08-08 05:20:37', '2025-08-08 05:20:37'),
(591, 45, 2, 6, '2025-08-08 05:20:37', '2025-08-08 05:20:37'),
(592, 45, 3, 9, '2025-08-08 05:20:37', '2025-08-08 05:20:37'),
(593, 45, 4, 13, '2025-08-08 05:20:37', '2025-08-08 05:20:37'),
(594, 45, 5, 16, '2025-08-08 05:20:38', '2025-08-08 05:20:38'),
(595, 45, 6, 24, '2025-08-08 05:20:38', '2025-08-08 05:20:38'),
(596, 45, 7, 29, '2025-08-08 05:20:38', '2025-08-08 05:20:38'),
(597, 45, 8, 34, '2025-08-08 05:20:38', '2025-08-08 05:20:38'),
(598, 45, 9, 40, '2025-08-08 05:20:39', '2025-08-08 05:20:39'),
(599, 45, 10, 46, '2025-08-08 05:20:39', '2025-08-08 05:20:39'),
(600, 45, 11, 57, '2025-08-08 05:20:39', '2025-08-08 05:20:39'),
(601, 45, 12, 66, '2025-08-08 05:20:39', '2025-08-08 05:20:39'),
(602, 45, 13, 73, '2025-08-08 05:20:39', '2025-08-08 05:20:39'),
(603, 45, 15, 83, '2025-08-08 05:20:40', '2025-08-08 05:20:40'),
(604, 45, 16, 89, '2025-08-08 05:20:40', '2025-08-08 05:20:40');

-- --------------------------------------------------------

--
-- Table structure for table `user_preference_values`
--

CREATE TABLE `user_preference_values` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `option_id` int DEFAULT NULL,
  `custom_value` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `range_min` int DEFAULT NULL,
  `range_max` int DEFAULT NULL,
  `is_any_selected` tinyint(1) DEFAULT '0',
  `importance` enum('must_have','important','nice_to_have','not_important') COLLATE utf8mb4_unicode_ci DEFAULT 'nice_to_have',
  `is_deal_breaker` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_progress`
--

CREATE TABLE `user_progress` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `question_id` int NOT NULL,
  `option_id` int NOT NULL,
  `analytic_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_progress`
--

INSERT INTO `user_progress` (`id`, `user_id`, `question_id`, `option_id`, `analytic_id`, `created_at`) VALUES
(1, 7, 1, 1, 1, '2024-09-28 01:46:08'),
(2, 7, 2, 3, 1, '2024-09-28 01:46:08'),
(3, 7, 3, 5, 1, '2024-09-28 01:46:09'),
(4, 7, 4, 7, 3, '2024-09-28 01:46:11'),
(5, 7, 5, 9, 3, '2024-09-28 01:46:13'),
(6, 7, 6, 11, 3, '2024-09-28 01:46:16'),
(7, 7, 7, 13, 5, '2024-09-28 01:46:18'),
(8, 7, 8, 16, 6, '2024-09-28 01:46:20'),
(9, 7, 9, 17, 5, '2024-09-28 01:46:22'),
(10, 7, 10, 20, 8, '2024-09-28 01:46:24'),
(11, 7, 11, 22, 8, '2024-09-28 01:46:26'),
(12, 7, 12, 23, 7, '2024-09-28 01:46:29'),
(13, 8, 1, 2, 2, '2024-09-28 05:54:36'),
(14, 8, 2, 4, 2, '2024-09-28 05:54:36'),
(15, 8, 3, 6, 2, '2024-09-28 05:54:37'),
(16, 8, 4, 7, 3, '2024-09-28 05:54:41'),
(17, 8, 5, 10, 4, '2024-09-28 05:54:42'),
(18, 8, 6, 12, 4, '2024-09-28 05:54:43'),
(19, 8, 7, 13, 5, '2024-09-28 05:54:44'),
(20, 8, 8, 15, 5, '2024-09-28 05:54:45'),
(21, 8, 9, 18, 6, '2024-09-28 05:54:46'),
(22, 8, 10, 20, 8, '2024-09-28 05:54:47'),
(23, 8, 11, 22, 8, '2024-09-28 05:54:48'),
(24, 8, 12, 23, 7, '2024-09-28 05:54:54'),
(25, 9, 1, 1, 1, '2024-09-28 07:42:10'),
(26, 9, 2, 4, 2, '2024-09-28 07:42:11'),
(27, 9, 3, 6, 2, '2024-09-28 07:42:11'),
(28, 9, 4, 8, 4, '2024-09-28 07:42:12'),
(29, 9, 5, 10, 4, '2024-09-28 07:42:13'),
(30, 9, 6, 12, 4, '2024-09-28 07:42:14'),
(31, 9, 7, 14, 6, '2024-09-28 07:42:15'),
(32, 9, 8, 16, 6, '2024-09-28 07:42:16'),
(33, 9, 9, 17, 5, '2024-09-28 07:42:16'),
(34, 9, 10, 20, 8, '2024-09-28 07:42:17'),
(35, 9, 11, 22, 8, '2024-09-28 07:42:18'),
(36, 9, 12, 23, 7, '2024-09-28 07:42:19'),
(37, 10, 1, 2, 2, '2024-09-28 08:57:41'),
(38, 10, 3, 5, 1, '2024-09-28 08:57:41'),
(39, 10, 2, 4, 2, '2024-09-28 08:57:42'),
(40, 10, 4, 7, 3, '2024-09-28 08:57:43'),
(41, 10, 5, 9, 3, '2024-09-28 08:57:44'),
(42, 10, 6, 12, 4, '2024-09-28 08:57:45'),
(43, 10, 7, 13, 5, '2024-09-28 08:57:46'),
(44, 10, 8, 16, 6, '2024-09-28 08:57:46'),
(45, 10, 9, 17, 5, '2024-09-28 08:57:47'),
(46, 10, 10, 19, 7, '2024-09-28 08:57:48'),
(47, 10, 11, 21, 7, '2024-09-28 08:57:49'),
(48, 10, 12, 23, 7, '2024-09-28 08:57:50'),
(49, 11, 1, 2, 2, '2024-09-28 09:20:38'),
(50, 11, 2, 3, 1, '2024-09-28 09:20:39'),
(51, 11, 3, 6, 2, '2024-09-28 09:20:39'),
(52, 11, 4, 8, 4, '2024-09-28 09:20:39'),
(53, 11, 5, 10, 4, '2024-09-28 09:20:40'),
(54, 11, 6, 12, 4, '2024-09-28 09:20:41'),
(55, 11, 7, 14, 6, '2024-09-28 09:20:43'),
(56, 11, 8, 15, 5, '2024-09-28 09:20:43'),
(57, 11, 9, 17, 5, '2024-09-28 09:20:44'),
(58, 11, 10, 20, 8, '2024-09-28 09:20:44'),
(59, 11, 11, 21, 7, '2024-09-28 09:20:46'),
(60, 11, 12, 23, 7, '2024-09-28 09:20:46'),
(61, 16, 1, 2, 2, '2024-09-29 01:36:18'),
(62, 16, 2, 4, 2, '2024-09-29 01:53:18'),
(63, 16, 3, 6, 2, '2024-09-29 01:53:49'),
(64, 16, 4, 8, 4, '2024-09-29 01:53:50'),
(65, 16, 5, 9, 3, '2024-09-29 01:53:51'),
(66, 16, 6, 11, 3, '2024-09-29 01:53:52'),
(67, 16, 7, 14, 6, '2024-09-29 01:53:53'),
(68, 16, 8, 16, 6, '2024-09-29 01:53:54'),
(69, 16, 9, 18, 6, '2024-09-29 01:53:56'),
(70, 16, 10, 20, 8, '2024-09-29 01:53:57'),
(71, 16, 11, 21, 7, '2024-09-29 01:53:59'),
(72, 16, 12, 24, 8, '2024-09-29 01:54:00'),
(73, 17, 1, 2, 2, '2024-09-29 02:20:26'),
(74, 17, 2, 4, 2, '2024-09-29 02:20:27'),
(75, 17, 3, 5, 1, '2024-09-29 02:20:29'),
(76, 17, 4, 8, 4, '2024-09-29 02:20:31'),
(77, 17, 5, 9, 3, '2024-09-29 02:20:33'),
(78, 17, 6, 11, 3, '2024-09-29 02:20:35'),
(79, 17, 7, 13, 5, '2024-09-29 02:20:38'),
(80, 17, 8, 16, 6, '2024-09-29 02:20:40'),
(81, 17, 9, 18, 6, '2024-09-29 02:20:42'),
(82, 17, 10, 19, 7, '2024-09-29 02:20:45'),
(83, 17, 11, 21, 7, '2024-09-29 02:20:47'),
(84, 17, 12, 24, 8, '2024-09-29 02:20:50'),
(85, 18, 1, 1, 1, '2025-04-07 12:00:02'),
(86, 18, 2, 4, 2, '2025-04-07 12:00:09'),
(87, 18, 3, 6, 2, '2025-04-07 12:00:09'),
(88, 18, 4, 8, 4, '2025-04-07 12:00:10'),
(89, 18, 5, 9, 3, '2025-04-07 12:00:11'),
(90, 18, 6, 11, 3, '2025-04-07 12:00:12'),
(91, 18, 7, 14, 6, '2025-04-07 12:00:13'),
(92, 18, 8, 16, 6, '2025-04-07 12:00:14'),
(93, 18, 9, 17, 5, '2025-04-07 12:00:15'),
(94, 18, 10, 20, 8, '2025-04-07 12:00:15'),
(95, 18, 11, 21, 7, '2025-04-07 12:00:16'),
(96, 18, 12, 23, 7, '2025-04-07 12:00:17'),
(97, 19, 1, 2, 2, '2025-04-07 13:43:53'),
(98, 19, 2, 4, 2, '2025-04-07 13:43:57'),
(99, 19, 3, 6, 2, '2025-04-07 13:43:59'),
(100, 19, 4, 8, 4, '2025-04-07 13:44:02'),
(101, 19, 5, 10, 4, '2025-04-07 13:44:05'),
(102, 19, 6, 11, 3, '2025-04-07 13:44:07'),
(103, 19, 7, 13, 5, '2025-04-07 13:44:09'),
(104, 19, 8, 15, 5, '2025-04-07 13:44:12'),
(105, 19, 9, 18, 6, '2025-04-07 13:44:14'),
(106, 19, 10, 20, 8, '2025-04-07 13:44:17'),
(107, 19, 11, 22, 8, '2025-04-07 13:44:20'),
(108, 19, 12, 23, 7, '2025-04-07 13:44:23'),
(109, 20, 1, 2, 2, '2025-04-07 14:18:31'),
(110, 20, 2, 4, 2, '2025-04-07 14:18:34'),
(111, 20, 3, 6, 2, '2025-04-07 14:18:38'),
(112, 20, 4, 8, 4, '2025-04-07 14:18:44'),
(113, 20, 5, 9, 3, '2025-04-07 14:18:52'),
(114, 20, 6, 12, 4, '2025-04-07 14:19:02'),
(115, 20, 7, 13, 5, '2025-04-07 14:19:18'),
(116, 20, 8, 16, 6, '2025-04-07 14:19:21'),
(117, 20, 9, 17, 5, '2025-04-07 14:19:25'),
(118, 20, 10, 20, 8, '2025-04-07 14:19:30'),
(119, 20, 11, 22, 8, '2025-04-07 14:19:33'),
(120, 20, 12, 24, 8, '2025-04-07 14:19:40'),
(121, 22, 1, 1, 1, '2025-04-08 04:50:48'),
(122, 22, 2, 4, 2, '2025-04-08 04:50:49'),
(123, 22, 4, 8, 4, '2025-04-08 04:50:51'),
(124, 22, 3, 6, 2, '2025-04-08 04:50:51'),
(125, 22, 5, 9, 3, '2025-04-08 04:50:52'),
(126, 22, 6, 11, 3, '2025-04-08 04:50:52'),
(127, 22, 7, 13, 5, '2025-04-08 04:50:53'),
(128, 22, 8, 15, 5, '2025-04-08 04:50:54'),
(129, 22, 9, 17, 5, '2025-04-08 04:50:56'),
(130, 22, 10, 20, 8, '2025-04-08 04:50:56'),
(131, 22, 11, 22, 8, '2025-04-08 04:50:57'),
(132, 22, 12, 24, 8, '2025-04-08 04:50:58'),
(133, 23, 1, 2, 2, '2025-04-10 11:32:56'),
(134, 23, 2, 4, 2, '2025-04-10 11:32:57'),
(135, 23, 3, 6, 2, '2025-04-10 11:32:58'),
(136, 23, 4, 8, 4, '2025-04-10 11:32:59'),
(137, 23, 6, 11, 3, '2025-04-10 11:33:00'),
(138, 23, 5, 10, 4, '2025-04-10 11:33:00'),
(139, 23, 7, 14, 6, '2025-04-10 11:33:01'),
(140, 23, 8, 16, 6, '2025-04-10 11:33:02'),
(141, 23, 9, 18, 6, '2025-04-10 11:33:02'),
(142, 23, 10, 19, 7, '2025-04-10 11:33:03'),
(143, 23, 11, 21, 7, '2025-04-10 11:33:04'),
(144, 23, 12, 24, 8, '2025-04-10 11:33:05'),
(145, 24, 1, 2, 2, '2025-04-10 11:37:32'),
(146, 24, 2, 3, 1, '2025-04-10 11:37:32'),
(147, 24, 3, 6, 2, '2025-04-10 11:37:33'),
(148, 24, 4, 8, 4, '2025-04-10 11:37:33'),
(149, 24, 5, 10, 4, '2025-04-10 11:37:34'),
(150, 24, 6, 11, 3, '2025-04-10 11:37:35'),
(151, 24, 7, 14, 6, '2025-04-10 11:37:36'),
(152, 24, 8, 15, 5, '2025-04-10 11:37:36'),
(153, 24, 9, 18, 6, '2025-04-10 11:37:37'),
(154, 24, 10, 19, 7, '2025-04-10 11:37:37'),
(155, 24, 11, 21, 7, '2025-04-10 11:37:38'),
(156, 24, 12, 23, 7, '2025-04-10 11:37:39'),
(157, 25, 1, 1, 1, '2025-04-11 12:31:26'),
(158, 25, 2, 3, 1, '2025-04-11 12:31:28'),
(159, 25, 3, 6, 2, '2025-04-11 12:31:30'),
(160, 25, 4, 8, 4, '2025-04-11 12:31:31'),
(161, 25, 5, 10, 4, '2025-04-11 12:31:33'),
(162, 25, 6, 12, 4, '2025-04-11 12:31:35'),
(163, 25, 7, 14, 6, '2025-04-11 12:31:37'),
(164, 25, 8, 16, 6, '2025-04-11 12:31:39'),
(165, 25, 9, 17, 5, '2025-04-11 12:31:49'),
(166, 25, 10, 20, 8, '2025-04-11 12:31:50'),
(167, 25, 11, 21, 7, '2025-04-11 12:31:52'),
(168, 25, 12, 24, 8, '2025-04-11 12:31:53'),
(169, 26, 1, 1, 1, '2025-04-12 15:15:50'),
(170, 26, 2, 4, 2, '2025-04-12 15:15:50'),
(171, 26, 3, 5, 1, '2025-04-12 15:15:51'),
(172, 26, 4, 8, 4, '2025-04-12 15:15:52'),
(173, 26, 5, 9, 3, '2025-04-12 15:15:54'),
(174, 26, 6, 11, 3, '2025-04-12 15:15:56'),
(175, 26, 7, 13, 5, '2025-04-12 15:15:57'),
(176, 26, 8, 16, 6, '2025-04-12 15:15:59'),
(177, 26, 9, 17, 5, '2025-04-12 15:16:00'),
(178, 26, 10, 19, 7, '2025-04-12 15:16:02'),
(179, 26, 11, 21, 7, '2025-04-12 15:16:03'),
(180, 26, 12, 24, 8, '2025-04-12 15:16:04'),
(181, 27, 1, 1, 1, '2025-04-13 11:24:59'),
(182, 27, 2, 4, 2, '2025-04-13 11:25:02'),
(183, 27, 3, 5, 1, '2025-04-13 11:25:03'),
(184, 27, 4, 8, 4, '2025-04-13 11:25:04'),
(185, 27, 5, 10, 4, '2025-04-13 11:25:04'),
(186, 27, 6, 11, 3, '2025-04-13 11:25:05'),
(187, 27, 7, 14, 6, '2025-04-13 11:25:06'),
(188, 27, 8, 15, 5, '2025-04-13 11:25:07'),
(189, 27, 9, 18, 6, '2025-04-13 11:25:08'),
(190, 27, 10, 19, 7, '2025-04-13 11:25:09'),
(191, 27, 11, 21, 7, '2025-04-13 11:25:10'),
(192, 27, 12, 23, 7, '2025-04-13 11:25:11'),
(193, 28, 1, 2, 2, '2025-04-13 12:00:14'),
(194, 28, 3, 5, 1, '2025-04-13 12:00:16'),
(195, 28, 2, 4, 2, '2025-04-13 12:00:16'),
(196, 28, 4, 7, 3, '2025-04-13 12:00:16'),
(197, 28, 5, 10, 4, '2025-04-13 12:00:17'),
(198, 28, 6, 11, 3, '2025-04-13 12:00:18'),
(199, 28, 7, 13, 5, '2025-04-13 12:00:19'),
(200, 28, 8, 16, 6, '2025-04-13 12:00:20'),
(201, 28, 9, 17, 5, '2025-04-13 12:00:20'),
(202, 28, 10, 20, 8, '2025-04-13 12:00:21'),
(203, 28, 11, 22, 8, '2025-04-13 12:00:22'),
(204, 28, 12, 24, 8, '2025-04-13 12:00:22'),
(205, 29, 1, 2, 2, '2025-04-13 13:55:27'),
(206, 29, 2, 4, 2, '2025-04-13 13:55:30'),
(207, 29, 3, 6, 2, '2025-04-13 13:55:36'),
(208, 29, 4, 8, 4, '2025-04-13 13:55:47'),
(209, 29, 5, 9, 3, '2025-04-13 13:55:56'),
(210, 29, 6, 11, 3, '2025-04-13 13:56:02'),
(211, 29, 7, 13, 5, '2025-04-13 13:56:09'),
(212, 29, 8, 15, 5, '2025-04-13 13:56:12'),
(213, 29, 9, 18, 6, '2025-04-13 13:56:20'),
(214, 29, 10, 20, 8, '2025-04-13 13:56:25'),
(215, 29, 11, 21, 7, '2025-04-13 13:56:35'),
(216, 29, 12, 23, 7, '2025-04-13 13:56:49'),
(217, 30, 1, 2, 2, '2025-04-13 16:55:08'),
(218, 30, 2, 4, 2, '2025-04-13 16:55:12'),
(219, 30, 3, 6, 2, '2025-04-13 16:55:17'),
(220, 30, 4, 7, 3, '2025-04-13 16:55:24'),
(221, 31, 1, 2, 2, '2025-04-15 11:35:01'),
(222, 31, 2, 4, 2, '2025-04-15 11:35:29'),
(223, 31, 3, 5, 1, '2025-04-15 11:35:30'),
(224, 31, 4, 7, 3, '2025-04-15 11:35:32'),
(225, 31, 5, 9, 3, '2025-04-15 11:35:38'),
(226, 31, 6, 11, 3, '2025-04-15 11:35:39'),
(227, 31, 7, 13, 5, '2025-04-15 11:35:40'),
(228, 31, 8, 15, 5, '2025-04-15 11:35:41'),
(229, 31, 9, 17, 5, '2025-04-15 11:35:42'),
(230, 31, 10, 19, 7, '2025-04-15 11:35:43'),
(231, 31, 12, 23, 7, '2025-04-15 11:35:45'),
(232, 31, 11, 21, 7, '2025-04-15 11:35:45'),
(233, 32, 1, 2, 2, '2025-04-15 11:50:39'),
(234, 32, 2, 4, 2, '2025-04-15 11:50:40'),
(235, 32, 3, 5, 1, '2025-04-15 11:50:41'),
(236, 32, 4, 7, 3, '2025-04-15 11:50:42'),
(237, 32, 5, 9, 3, '2025-04-15 11:50:43'),
(238, 32, 6, 12, 4, '2025-04-15 11:50:44'),
(239, 32, 7, 14, 6, '2025-04-15 11:50:45'),
(240, 32, 8, 16, 6, '2025-04-15 11:50:46'),
(241, 32, 9, 17, 5, '2025-04-15 11:50:47'),
(242, 32, 10, 19, 7, '2025-04-15 11:50:48'),
(243, 32, 11, 21, 7, '2025-04-15 11:50:49'),
(244, 32, 12, 23, 7, '2025-04-15 11:50:50'),
(245, 33, 1, 2, 2, '2025-04-16 06:29:55'),
(246, 33, 3, 5, 1, '2025-04-16 06:29:56'),
(247, 33, 2, 3, 1, '2025-04-16 06:29:57'),
(248, 33, 4, 7, 3, '2025-04-16 06:29:57'),
(249, 33, 5, 9, 3, '2025-04-16 06:29:58'),
(250, 33, 6, 11, 3, '2025-04-16 06:29:58'),
(251, 33, 7, 14, 6, '2025-04-16 06:29:59'),
(252, 33, 8, 16, 6, '2025-04-16 06:30:00'),
(253, 33, 9, 18, 6, '2025-04-16 06:30:01'),
(254, 33, 10, 19, 7, '2025-04-16 06:30:02'),
(255, 33, 11, 22, 8, '2025-04-16 06:30:02'),
(256, 33, 12, 24, 8, '2025-04-16 06:30:04'),
(257, 34, 1, 2, 2, '2025-04-19 05:23:52'),
(258, 34, 2, 4, 2, '2025-04-19 05:23:54'),
(259, 34, 3, 6, 2, '2025-04-19 05:23:55'),
(260, 34, 4, 7, 3, '2025-04-19 05:23:55'),
(261, 34, 5, 10, 4, '2025-04-19 05:23:56'),
(262, 34, 6, 11, 3, '2025-04-19 05:23:57'),
(263, 34, 7, 13, 5, '2025-04-19 05:23:57'),
(264, 34, 8, 15, 5, '2025-04-19 05:23:58'),
(265, 34, 9, 17, 5, '2025-04-19 05:23:59'),
(266, 34, 10, 19, 7, '2025-04-19 05:23:59'),
(267, 34, 11, 22, 8, '2025-04-19 05:24:00'),
(268, 34, 12, 24, 8, '2025-04-19 05:24:00'),
(269, 35, 1, 1, 1, '2025-04-19 10:25:32'),
(270, 35, 2, 3, 1, '2025-04-19 10:25:35'),
(271, 35, 3, 6, 2, '2025-04-19 10:25:38'),
(272, 35, 4, 8, 4, '2025-04-19 10:25:45'),
(273, 35, 5, 10, 4, '2025-04-19 10:25:47'),
(274, 35, 6, 12, 4, '2025-04-19 10:25:50'),
(275, 35, 7, 14, 6, '2025-04-19 10:25:58'),
(276, 35, 8, 15, 5, '2025-04-19 10:26:02'),
(277, 35, 9, 17, 5, '2025-04-19 10:26:06'),
(278, 35, 10, 20, 8, '2025-04-19 10:26:09'),
(279, 35, 11, 22, 8, '2025-04-19 10:26:12'),
(280, 35, 12, 24, 8, '2025-04-19 10:26:15'),
(281, 36, 1, 2, 2, '2025-04-19 13:49:39'),
(282, 36, 2, 4, 2, '2025-04-19 13:49:41'),
(283, 36, 3, 6, 2, '2025-04-19 13:49:42'),
(284, 36, 4, 7, 3, '2025-04-19 13:49:44'),
(285, 36, 5, 9, 3, '2025-04-19 13:49:46'),
(286, 36, 6, 11, 3, '2025-04-19 13:49:48'),
(287, 36, 7, 14, 6, '2025-04-19 13:49:50'),
(288, 36, 8, 16, 6, '2025-04-19 13:49:52'),
(289, 36, 9, 17, 5, '2025-04-19 13:49:54'),
(290, 36, 10, 19, 7, '2025-04-19 13:49:58'),
(291, 36, 11, 21, 7, '2025-04-19 13:49:59'),
(292, 36, 12, 23, 7, '2025-04-19 13:50:03'),
(293, 37, 1, 1, 1, '2025-04-19 17:12:12'),
(294, 37, 2, 4, 2, '2025-04-19 17:12:12'),
(295, 37, 3, 5, 1, '2025-04-19 17:12:13'),
(296, 37, 4, 7, 3, '2025-04-19 17:12:13'),
(297, 37, 5, 9, 3, '2025-04-19 17:12:28'),
(298, 37, 6, 12, 4, '2025-04-19 17:12:29'),
(299, 37, 7, 13, 5, '2025-04-19 17:12:30'),
(300, 37, 8, 15, 5, '2025-04-19 17:12:31'),
(301, 37, 9, 18, 6, '2025-04-19 17:12:31'),
(302, 37, 10, 20, 8, '2025-04-19 17:12:32'),
(303, 37, 11, 21, 7, '2025-04-19 17:12:33'),
(304, 37, 12, 24, 8, '2025-04-19 17:12:34'),
(305, 39, 1, 2, 2, '2025-04-19 18:43:25'),
(306, 39, 2, 4, 2, '2025-04-19 18:43:25'),
(307, 39, 3, 6, 2, '2025-04-19 18:43:26'),
(308, 39, 4, 7, 3, '2025-04-19 18:43:27'),
(309, 39, 5, 10, 4, '2025-04-19 18:43:27'),
(310, 39, 6, 11, 3, '2025-04-19 18:43:29'),
(311, 39, 7, 14, 6, '2025-04-19 18:43:30'),
(312, 39, 8, 16, 6, '2025-04-19 18:43:30'),
(313, 39, 9, 18, 6, '2025-04-19 18:43:31'),
(314, 39, 10, 20, 8, '2025-04-19 18:43:32'),
(315, 39, 11, 22, 8, '2025-04-19 18:43:32'),
(316, 39, 12, 24, 8, '2025-04-19 18:43:33'),
(317, 40, 1, 1, 1, '2025-04-19 19:23:22'),
(318, 40, 2, 3, 1, '2025-04-19 19:23:23'),
(319, 40, 3, 5, 1, '2025-04-19 19:23:24'),
(320, 40, 4, 8, 4, '2025-04-19 19:23:26'),
(321, 40, 5, 9, 3, '2025-04-19 19:23:27'),
(322, 40, 6, 11, 3, '2025-04-19 19:23:29'),
(323, 40, 7, 14, 6, '2025-04-19 19:23:30'),
(324, 40, 8, 15, 5, '2025-04-19 19:23:31'),
(325, 40, 9, 18, 6, '2025-04-19 19:23:32'),
(326, 40, 10, 19, 7, '2025-04-19 19:23:33'),
(327, 40, 11, 22, 8, '2025-04-19 19:23:35'),
(328, 40, 12, 23, 7, '2025-04-19 19:23:39'),
(329, 41, 1, 2, 2, '2025-08-01 06:36:39'),
(330, 41, 2, 3, 1, '2025-08-01 06:36:40'),
(331, 41, 3, 6, 2, '2025-08-01 06:36:43'),
(332, 41, 4, 7, 3, '2025-08-01 06:36:46'),
(333, 41, 5, 9, 3, '2025-08-01 06:36:53'),
(334, 41, 6, 12, 4, '2025-08-01 06:37:00'),
(335, 41, 7, 14, 6, '2025-08-01 06:37:08'),
(336, 41, 8, 15, 5, '2025-08-01 06:37:31'),
(337, 41, 9, 17, 5, '2025-08-01 06:37:35'),
(338, 41, 10, 19, 7, '2025-08-01 06:37:40'),
(339, 41, 11, 21, 7, '2025-08-01 06:37:46'),
(340, 41, 12, 23, 7, '2025-08-01 06:37:51'),
(341, 43, 1, 2, 2, '2025-08-04 13:08:39'),
(342, 43, 2, 3, 1, '2025-08-04 13:08:40'),
(343, 43, 3, 6, 2, '2025-08-04 13:08:42'),
(344, 43, 4, 7, 3, '2025-08-04 13:08:43'),
(345, 43, 5, 10, 4, '2025-08-04 13:08:45'),
(346, 43, 6, 11, 3, '2025-08-04 13:08:48'),
(347, 43, 7, 14, 6, '2025-08-04 13:08:49'),
(348, 43, 8, 15, 5, '2025-08-04 13:08:51'),
(349, 43, 9, 18, 6, '2025-08-04 13:08:53'),
(350, 43, 10, 19, 7, '2025-08-04 13:08:56'),
(351, 43, 11, 21, 7, '2025-08-04 13:08:58'),
(352, 43, 12, 24, 8, '2025-08-04 13:09:02'),
(353, 44, 1, 1, 1, '2025-08-04 13:15:07'),
(354, 44, 2, 4, 2, '2025-08-04 13:15:07'),
(355, 44, 3, 5, 1, '2025-08-04 13:15:07'),
(356, 44, 4, 8, 4, '2025-08-04 13:15:09'),
(357, 44, 5, 10, 4, '2025-08-04 13:15:11'),
(358, 44, 6, 12, 4, '2025-08-04 13:15:13'),
(359, 44, 7, 14, 6, '2025-08-04 13:15:14'),
(360, 44, 8, 16, 6, '2025-08-04 13:15:15'),
(361, 44, 9, 18, 6, '2025-08-04 13:15:16'),
(362, 44, 10, 20, 8, '2025-08-04 13:15:17'),
(363, 44, 11, 21, 7, '2025-08-04 13:15:19'),
(364, 44, 12, 24, 8, '2025-08-04 13:15:19'),
(365, 45, 1, 2, 2, '2025-08-08 05:20:57'),
(366, 45, 2, 4, 2, '2025-08-08 05:21:02'),
(367, 45, 3, 6, 2, '2025-08-08 05:21:21'),
(368, 45, 4, 8, 4, '2025-08-08 05:21:23'),
(369, 45, 5, 9, 3, '2025-08-08 05:21:24'),
(370, 45, 6, 11, 3, '2025-08-08 05:21:26'),
(371, 45, 7, 14, 6, '2025-08-08 05:21:28'),
(372, 45, 8, 16, 6, '2025-08-08 05:21:31'),
(373, 45, 9, 17, 5, '2025-08-08 05:21:36'),
(374, 45, 10, 19, 7, '2025-08-08 05:21:38'),
(375, 45, 11, 21, 7, '2025-08-08 05:21:55'),
(376, 45, 12, 23, 7, '2025-08-08 05:21:57'),
(377, 48, 1, 2, 2, '2025-08-09 01:28:23'),
(378, 48, 2, 4, 2, '2025-08-09 01:28:36'),
(379, 48, 3, 5, 1, '2025-08-09 01:28:39'),
(380, 48, 4, 8, 4, '2025-08-09 01:28:41'),
(381, 48, 5, 9, 3, '2025-08-09 01:28:42'),
(382, 48, 6, 12, 4, '2025-08-09 01:28:43'),
(383, 48, 7, 13, 5, '2025-08-09 01:28:45'),
(384, 48, 8, 16, 6, '2025-08-09 01:28:46'),
(385, 48, 9, 17, 5, '2025-08-09 01:28:48'),
(386, 48, 10, 20, 8, '2025-08-09 01:28:49'),
(387, 48, 11, 22, 8, '2025-08-09 01:28:50'),
(388, 48, 12, 23, 7, '2025-08-09 01:28:54'),
(389, 47, 1, 2, 2, '2025-08-11 05:13:57'),
(390, 47, 2, 3, 1, '2025-08-11 05:13:57'),
(391, 47, 3, 6, 2, '2025-08-11 05:13:59'),
(392, 47, 4, 8, 4, '2025-08-11 05:14:01'),
(393, 47, 5, 9, 3, '2025-08-11 05:14:02'),
(394, 47, 6, 11, 3, '2025-08-11 05:14:03'),
(395, 47, 7, 13, 5, '2025-08-11 05:14:05'),
(396, 47, 8, 16, 6, '2025-08-11 05:14:07'),
(397, 47, 9, 17, 5, '2025-08-11 05:14:08'),
(398, 47, 10, 20, 8, '2025-08-11 05:14:10'),
(399, 47, 11, 22, 8, '2025-08-11 05:14:11'),
(400, 47, 12, 23, 7, '2025-08-11 05:14:15'),
(401, 49, 1, 1, 1, '2025-08-23 04:54:29'),
(402, 49, 2, 4, 2, '2025-08-23 04:54:29'),
(403, 49, 3, 5, 1, '2025-08-23 04:54:30'),
(404, 49, 4, 8, 4, '2025-08-23 04:54:32'),
(405, 49, 5, 10, 4, '2025-08-23 04:54:33'),
(406, 49, 6, 11, 3, '2025-08-23 04:54:34'),
(407, 49, 7, 13, 5, '2025-08-23 04:54:35'),
(408, 49, 8, 16, 6, '2025-08-23 04:54:37'),
(409, 49, 9, 17, 5, '2025-08-23 04:54:38'),
(410, 49, 10, 20, 8, '2025-08-23 04:54:39'),
(411, 49, 11, 22, 8, '2025-08-23 04:54:41'),
(412, 49, 12, 24, 8, '2025-08-23 04:54:42'),
(413, 46, 1, 2, 2, '2025-08-23 13:55:27'),
(414, 46, 2, 3, 1, '2025-08-23 13:55:28'),
(415, 46, 3, 6, 2, '2025-08-23 13:55:28'),
(416, 46, 4, 7, 3, '2025-08-23 13:55:30'),
(417, 46, 5, 10, 4, '2025-08-23 13:55:31'),
(418, 46, 6, 11, 3, '2025-08-23 13:55:32'),
(419, 46, 7, 14, 6, '2025-08-23 13:55:34'),
(420, 46, 8, 16, 6, '2025-08-23 13:55:35'),
(421, 46, 9, 18, 6, '2025-08-23 13:55:36'),
(422, 46, 10, 20, 8, '2025-08-23 13:55:38'),
(423, 46, 11, 21, 7, '2025-08-23 13:55:40'),
(424, 46, 12, 23, 7, '2025-08-23 13:55:44');

-- --------------------------------------------------------

--
-- Table structure for table `user_range_preferences`
--

CREATE TABLE `user_range_preferences` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `min_value` int NOT NULL,
  `max_value` int NOT NULL,
  `importance` enum('must_have','important','nice_to_have','not_important') DEFAULT 'nice_to_have',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_red_flags`
--

CREATE TABLE `user_red_flags` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `answer_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_red_flags`
--

INSERT INTO `user_red_flags` (`id`, `user_id`, `answer_id`, `created_at`) VALUES
(1, 26, 45, '2025-04-12 15:31:58'),
(2, 26, 49, '2025-04-12 15:32:08'),
(3, 26, 53, '2025-04-12 15:32:13'),
(8, 33, 2, '2025-04-16 06:30:10'),
(11, 33, 3, '2025-04-16 10:05:15'),
(12, 33, 4, '2025-04-16 10:05:16'),
(13, 35, 48, '2025-04-19 10:28:42'),
(14, 35, 56, '2025-04-19 10:29:09'),
(15, 35, 60, '2025-04-19 10:29:15'),
(16, 36, 13, '2025-04-19 13:50:53'),
(17, 36, 61, '2025-04-19 13:52:36'),
(27, 45, 41, '2025-08-08 05:23:49');

-- --------------------------------------------------------

--
-- Table structure for table `user_subscriptions`
--

CREATE TABLE `user_subscriptions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `status` enum('active','expired','cancelled','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NOT NULL,
  `auto_renew` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `billing_cycle` enum('monthly','quarterly','annual') COLLATE utf8mb4_unicode_ci DEFAULT 'quarterly',
  `next_billing_date` timestamp NULL DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'razorpay',
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancel_reason` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_subscriptions`
--

INSERT INTO `user_subscriptions` (`id`, `user_id`, `plan_id`, `status`, `start_date`, `end_date`, `auto_renew`, `created_at`, `updated_at`, `billing_cycle`, `next_billing_date`, `payment_method`, `cancelled_at`, `cancel_reason`) VALUES
(1, 48, 3, 'pending', '2025-08-10 01:36:41', '2025-11-10 01:36:41', 1, '2025-08-10 01:36:41', '2025-08-10 01:36:41', 'quarterly', NULL, 'razorpay', NULL, NULL),
(2, 48, 3, 'active', '2025-08-10 01:40:35', '2025-11-10 01:40:35', 1, '2025-08-10 01:40:36', '2025-08-10 01:43:26', 'quarterly', NULL, 'razorpay', NULL, NULL),
(3, 49, 2, 'pending', '2025-08-23 04:55:35', '2025-11-23 04:55:35', 1, '2025-08-23 04:55:35', '2025-08-23 04:55:35', 'quarterly', NULL, 'razorpay', NULL, NULL),
(4, 49, 2, 'pending', '2025-08-23 04:55:51', '2025-11-23 04:55:51', 1, '2025-08-23 04:55:50', '2025-08-23 04:55:50', 'quarterly', NULL, 'razorpay', NULL, NULL),
(5, 49, 2, 'pending', '2025-08-23 04:56:54', '2025-11-23 04:56:54', 1, '2025-08-23 04:56:54', '2025-08-23 04:56:54', 'quarterly', NULL, 'razorpay', NULL, NULL),
(6, 49, 5, 'pending', '2025-08-23 04:57:15', '2026-08-23 04:57:15', 1, '2025-08-23 04:57:15', '2025-08-23 04:57:15', 'quarterly', NULL, 'razorpay', NULL, NULL),
(7, 41, 3, 'pending', '2025-08-23 13:43:08', '2025-11-23 13:43:08', 1, '2025-08-23 13:43:08', '2025-08-23 13:43:08', 'quarterly', NULL, 'razorpay', NULL, NULL),
(8, 41, 3, 'pending', '2025-08-23 13:46:10', '2025-11-23 13:46:10', 1, '2025-08-23 13:46:10', '2025-08-23 13:46:10', 'quarterly', NULL, 'razorpay', NULL, NULL),
(9, 41, 3, 'pending', '2025-08-23 13:49:44', '2025-11-23 13:49:44', 1, '2025-08-23 13:49:44', '2025-08-23 13:49:44', 'quarterly', NULL, 'razorpay', NULL, NULL),
(10, 41, 2, 'pending', '2025-08-23 13:51:40', '2025-11-23 13:51:40', 1, '2025-08-23 13:51:40', '2025-08-23 13:51:40', 'quarterly', NULL, 'razorpay', NULL, NULL),
(11, 41, 3, 'pending', '2025-08-23 13:54:07', '2025-11-23 13:54:07', 1, '2025-08-23 13:54:07', '2025-08-23 13:54:07', 'quarterly', NULL, 'razorpay', NULL, NULL),
(12, 46, 3, 'pending', '2025-08-23 13:56:07', '2025-11-23 13:56:07', 1, '2025-08-23 13:56:07', '2025-08-23 13:56:07', 'quarterly', NULL, 'razorpay', NULL, NULL),
(13, 46, 2, 'pending', '2025-08-23 13:59:31', '2025-11-23 13:59:31', 1, '2025-08-23 13:59:31', '2025-08-23 13:59:31', 'quarterly', NULL, 'razorpay', NULL, NULL),
(20, 46, 2, 'active', '2025-08-23 14:16:27', '2025-11-23 14:16:27', 1, '2025-08-23 14:16:27', '2025-08-23 14:16:27', 'quarterly', NULL, 'razorpay', NULL, NULL);

--
-- Triggers `user_subscriptions`
--
DELIMITER $$
CREATE TRIGGER `award_subscription_badges` AFTER UPDATE ON `user_subscriptions` FOR EACH ROW BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    -- Award elite badge for elite plan
    IF EXISTS (SELECT 1 FROM subscription_plans WHERE id = NEW.plan_id AND plan_name = 'elite') THEN
      INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description)
      VALUES (NEW.user_id, 'elite', 'Elite Member', 'Premium member with exclusive benefits')
      ON DUPLICATE KEY UPDATE 
        is_active = true,
        awarded_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- Award premium badge for pro plan
    IF EXISTS (SELECT 1 FROM subscription_plans WHERE id = NEW.plan_id AND plan_name = 'pro') THEN
      INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description)
      VALUES (NEW.user_id, 'premium', 'Pro Member', 'Pro member with advanced features')
      ON DUPLICATE KEY UPDATE 
        is_active = true,
        awarded_at = CURRENT_TIMESTAMP;
    END IF;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_user_plan_on_subscription` AFTER UPDATE ON `user_subscriptions` FOR EACH ROW BEGIN
  IF NEW.status = 'active' AND OLD.status != 'active' THEN
    UPDATE user u
    JOIN subscription_plans sp ON NEW.plan_id = sp.id
    SET 
      u.current_plan = sp.plan_name,
      u.subscription_status = 'active',
      u.subscription_ends = NEW.end_date
    WHERE u.id = NEW.user_id;
  ELSEIF NEW.status = 'expired' AND OLD.status = 'active' THEN
    UPDATE user 
    SET 
      current_plan = 'free',
      subscription_status = 'expired'
    WHERE id = NEW.user_id;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `user_suggestions`
--

CREATE TABLE `user_suggestions` (
  `id` int NOT NULL,
  `ai_character_id` int NOT NULL,
  `requester_user_id` int NOT NULL,
  `suggested_user_id` int NOT NULL,
  `suggestion_reason` text,
  `compatibility_score` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','accepted','rejected','expired') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_suggestions`
--

INSERT INTO `user_suggestions` (`id`, `ai_character_id`, `requester_user_id`, `suggested_user_id`, `suggestion_reason`, `compatibility_score`, `created_at`, `status`) VALUES
(1, 7, 44, 12, 'I think you and Mrunal would make great friends! You both share 2 AI companions and have 3 common preferences. Your personality types (ENFP and Unknown) suggest you\'d complement each other well. Starting a group chat with Kofi could be the perfect way to break the ice! 🤝', 84, '2025-08-06 22:56:39', 'pending'),
(2, 11, 41, 34, 'I think you and test_user_05 would make great friends! You both share 5 AI companions and have 3 common preferences. Your personality types (ISTJ and ISTJ) suggest you\'d complement each other well. Starting a group chat with Viktor could be the perfect way to break the ice! 🤝', 82, '2025-08-06 22:59:25', 'accepted'),
(3, 2, 41, 29, 'I think you and Mrunu21 would make great friends! You both share 5 AI companions and have 3 common interests. Based on your conversation patterns and preferences, I believe you\'d complement each other well and have great discussions. Starting a group chat with Amara could be the perfect way to break the ice! 🤝', 85, '2025-08-06 23:05:47', 'expired'),
(4, 2, 41, 2, 'I think you and AvniG16748 would make great friends! You both share 2 AI companions and have 2 common interests. Based on your conversation patterns and preferences, I believe you\'d complement each other well and have great discussions. Starting a group chat with Amara could be the perfect way to break the ice! 🤝', 78, '2025-08-06 23:06:20', 'pending'),
(5, 7, 44, 30, 'I think you and test_user_15 would make great friends! You both share 1 AI companion and have 3 common interests. Based on your conversation patterns and preferences, I believe you\'d complement each other well and have great discussions. Starting a group chat with Kofi could be the perfect way to break the ice! 🤝', 82, '2025-08-07 08:32:35', 'pending'),
(6, 7, 44, 19, 'I think you and karmun21 would make great friends! You both share 3 AI companions and have 4 common interests. Based on your conversation patterns and preferences, I believe you\'d complement each other well and have great discussions. Starting a group chat with Kofi could be the perfect way to break the ice! 🤝', 76, '2025-08-07 19:45:47', 'rejected'),
(7, 7, 44, 25, 'I think you and Test user 55 would make great friends! You both share 5 AI companions and have 2 common interests. Based on your conversation patterns and preferences, I believe you\'d complement each other well and have great discussions. Starting a group chat with Kofi could be the perfect way to break the ice! 🤝', 85, '2025-08-07 19:46:20', 'accepted'),
(8, 2, 41, 10, 'I think you and jino3 would make great friends! You both share 5 AI companions and have 0 common interests. Based on your conversation patterns and preferences, I believe you\'d complement each other well and have great discussions. Starting a group chat with Amara could be the perfect way to break the ice! 🤝', 77, '2025-08-08 05:36:54', 'pending');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_creator`
--
ALTER TABLE `account_creator`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ai_capabilities`
--
ALTER TABLE `ai_capabilities`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_ai_capability` (`ai_character_id`,`capability_name`),
  ADD KEY `idx_capability_type` (`capability_type`);

--
-- Indexes for table `ai_characters`
--
ALTER TABLE `ai_characters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_mbti_type` (`mbti_type`);

--
-- Indexes for table `ai_chat_sessions`
--
ALTER TABLE `ai_chat_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `ai_character_id` (`ai_character_id`),
  ADD KEY `ai_conversation_id` (`ai_conversation_id`),
  ADD KEY `idx_user_session` (`user_id`,`status`),
  ADD KEY `idx_activity` (`last_activity_at`);

--
-- Indexes for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ai_character_id` (`ai_character_id`),
  ADD KEY `idx_user_ai` (`user_id`,`ai_character_id`),
  ADD KEY `idx_last_message` (`last_message_at`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `ai_conversation_ratings`
--
ALTER TABLE `ai_conversation_ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_conversation_rating` (`user_id`,`ai_conversation_id`),
  ADD KEY `ai_conversation_id` (`ai_conversation_id`),
  ADD KEY `idx_ai_ratings` (`ai_character_id`,`rating`);

--
-- Indexes for table `ai_learning_data`
--
ALTER TABLE `ai_learning_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `conversation_id` (`conversation_id`),
  ADD KEY `idx_ai_learning` (`ai_character_id`,`interaction_type`),
  ADD KEY `idx_satisfaction` (`user_satisfaction_score`);

--
-- Indexes for table `ai_messages`
--
ALTER TABLE `ai_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_user_id` (`sender_user_id`),
  ADD KEY `sender_ai_id` (`sender_ai_id`),
  ADD KEY `parent_message_id` (`parent_message_id`),
  ADD KEY `idx_conversation_time` (`ai_conversation_id`,`created_at`),
  ADD KEY `idx_sender` (`sender_type`,`sender_user_id`,`sender_ai_id`);

--
-- Indexes for table `ai_message_reactions`
--
ALTER TABLE `ai_message_reactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_message_reaction` (`user_id`,`ai_message_id`,`reaction_type`),
  ADD KEY `idx_message_reactions` (`ai_message_id`);

--
-- Indexes for table `analytics_question`
--
ALTER TABLE `analytics_question`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `answers`
--
ALTER TABLE `answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `answers_question_id_questions_id_fk` (`question_id`);

--
-- Indexes for table `compatibility_results`
--
ALTER TABLE `compatibility_results`
  ADD PRIMARY KEY (`result_id`),
  ADD KEY `compatibility_results_test_id_tests_test_id_fk` (`test_id`),
  ADD KEY `compatibility_results_user_1_id_user_details_id_fk` (`user_1_id`),
  ADD KEY `compatibility_results_user_2_id_user_details_id_fk` (`user_2_id`);

--
-- Indexes for table `connections`
--
ALTER TABLE `connections`
  ADD PRIMARY KEY (`connection_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `idx_connections_premium` (`is_premium_connection`,`connection_type`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_convo_unique` (`conversation_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `couples`
--
ALTER TABLE `couples`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`couple_id`),
  ADD KEY `couple_id` (`couple_id`);

--
-- Indexes for table `daily_connection_usage`
--
ALTER TABLE `daily_connection_usage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_date_unique` (`user_id`,`date`),
  ADD KEY `idx_daily_usage_date` (`date`);

--
-- Indexes for table `education_levels`
--
ALTER TABLE `education_levels`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `level_name` (`level_name`);

--
-- Indexes for table `feature_usage`
--
ALTER TABLE `feature_usage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_feature_date` (`user_id`,`feature_name`,`reset_date`),
  ADD KEY `idx_feature_usage_reset_date` (`reset_date`),
  ADD KEY `idx_feature_usage_feature` (`feature_name`);

--
-- Indexes for table `group_chats`
--
ALTER TABLE `group_chats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ai_character_id` (`ai_character_id`),
  ADD KEY `created_by_user_id` (`created_by_user_id`);

--
-- Indexes for table `group_chat_invitations`
--
ALTER TABLE `group_chat_invitations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_invitation` (`ai_character_id`,`initiator_user_id`,`invited_user_id`),
  ADD KEY `initiator_user_id` (`initiator_user_id`),
  ADD KEY `invited_user_id` (`invited_user_id`);

--
-- Indexes for table `group_chat_messages`
--
ALTER TABLE `group_chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `group_chat_id` (`group_chat_id`),
  ADD KEY `sender_user_id` (`sender_user_id`),
  ADD KEY `sender_ai_id` (`sender_ai_id`);

--
-- Indexes for table `group_chat_participants`
--
ALTER TABLE `group_chat_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_participant` (`group_chat_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `interests`
--
ALTER TABLE `interests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_name_unique` (`category_id`,`name`);

--
-- Indexes for table `interest_categories`
--
ALTER TABLE `interest_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `invitations`
--
ALTER TABLE `invitations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_user_id` (`user_id`),
  ADD KEY `fk_inviter_id` (`inviter_id`);

--
-- Indexes for table `job_titles`
--
ALTER TABLE `job_titles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `title` (`title`);

--
-- Indexes for table `languages`
--
ALTER TABLE `languages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mbti_ai_compatibility`
--
ALTER TABLE `mbti_ai_compatibility`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_mbti_ai_match` (`user_mbti_type`,`ai_mbti_type`);

--
-- Indexes for table `mbti_compatibility`
--
ALTER TABLE `mbti_compatibility`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mbti_type` (`mbti_type`,`compatible_type`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversation_id` (`conversation_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `reply_to_id` (`reply_to_id`);

--
-- Indexes for table `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `message_id` (`message_id`);

--
-- Indexes for table `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_reaction_unique` (`message_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `message_reads`
--
ALTER TABLE `message_reads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `message_read_unique` (`message_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `options`
--
ALTER TABLE `options`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_webhooks`
--
ALTER TABLE `payment_webhooks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event_type` (`event_type`),
  ADD KEY `idx_payment_id` (`razorpay_payment_id`),
  ADD KEY `idx_order_id` (`razorpay_order_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `people_pair`
--
ALTER TABLE `people_pair`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `preference_categories`
--
ALTER TABLE `preference_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `preference_options`
--
ALTER TABLE `preference_options`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_value_unique` (`category_id`,`value`);

--
-- Indexes for table `profile_boosts`
--
ALTER TABLE `profile_boosts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_profile_boosts_user_id` (`user_id`),
  ADD KEY `idx_profile_boosts_active` (`is_active`,`end_date`),
  ADD KEY `idx_profile_boosts_dates` (`start_date`,`end_date`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `questions_test_id_tests_test_id_fk` (`test_id`);

--
-- Indexes for table `quiz_completion`
--
ALTER TABLE `quiz_completion`
  ADD PRIMARY KEY (`completion_id`),
  ADD KEY `quiz_completion_user_id_user_details_id_fk` (`user_id`),
  ADD KEY `quiz_completion_test_id_tests_test_id_fk` (`test_id`);

--
-- Indexes for table `quiz_sequences`
--
ALTER TABLE `quiz_sequences`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `razorpay_orders`
--
ALTER TABLE `razorpay_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `razorpay_order_id` (`razorpay_order_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_razorpay_order_id` (`razorpay_order_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `razorpay_orders_plan_id_fkey` (`plan_id`);

--
-- Indexes for table `subscription_payments`
--
ALTER TABLE `subscription_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_subscription_payments_user_id` (`user_id`),
  ADD KEY `idx_subscription_payments_subscription_id` (`subscription_id`),
  ADD KEY `idx_subscription_payments_payment_id` (`payment_id`),
  ADD KEY `idx_subscription_payments_status` (`status`),
  ADD KEY `idx_payment_status_date` (`status`,`paid_at`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_plan_period` (`plan_name`,`billing_period`);

--
-- Indexes for table `tests`
--
ALTER TABLE `tests`
  ADD PRIMARY KEY (`test_id`);

--
-- Indexes for table `test_progress`
--
ALTER TABLE `test_progress`
  ADD PRIMARY KEY (`progress_id`),
  ADD KEY `test_progress_user_id_user_details_id_fk` (`user_id`),
  ADD KEY `test_progress_test_id_tests_test_id_fk` (`test_id`),
  ADD KEY `test_progress_question_id_questions_id_fk` (`question_id`),
  ADD KEY `test_progress_selected_answer_id_answers_id_fk` (`selected_answer_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_current_plan` (`current_plan`),
  ADD KEY `idx_user_subscription_status` (`subscription_status`,`subscription_ends`),
  ADD KEY `idx_user_profile_boost` (`profile_boost_active`,`profile_boost_ends`),
  ADD KEY `idx_user_verified` (`is_verified`,`verification_date`);

--
-- Indexes for table `user_ai_friends`
--
ALTER TABLE `user_ai_friends`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_ai_friends_unique` (`user_id`,`friend_index`),
  ADD KEY `idx_user_mbti` (`user_mbti_type`),
  ADD KEY `idx_ai_mbti` (`ai_friend_mbti_type`);

--
-- Indexes for table `user_ai_preferences`
--
ALTER TABLE `user_ai_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_ai_pref` (`user_id`,`ai_character_id`,`preference_key`),
  ADD KEY `ai_character_id` (`ai_character_id`),
  ADD KEY `idx_user_prefs` (`user_id`);

--
-- Indexes for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_badge_unique` (`user_id`,`badge_type`),
  ADD KEY `idx_user_badges_active` (`is_active`),
  ADD KEY `idx_user_badges_type` (`badge_type`);

--
-- Indexes for table `user_chat_settings`
--
ALTER TABLE `user_chat_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `user_details`
--
ALTER TABLE `user_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_education`
--
ALTER TABLE `user_education`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_education_level` (`education_level_id`);

--
-- Indexes for table `user_interests`
--
ALTER TABLE `user_interests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_interest_unique` (`user_id`,`interest_id`),
  ADD KEY `interest_id` (`interest_id`);

--
-- Indexes for table `user_job`
--
ALTER TABLE `user_job`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_job_title` (`job_title_id`);

--
-- Indexes for table `user_languages`
--
ALTER TABLE `user_languages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_matching_multi_preferences`
--
ALTER TABLE `user_matching_multi_preferences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `option_id` (`option_id`);

--
-- Indexes for table `user_matching_preferences`
--
ALTER TABLE `user_matching_preferences`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `user_mbti_assessment`
--
ALTER TABLE `user_mbti_assessment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `user_multi_preferences`
--
ALTER TABLE `user_multi_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_option_unique` (`user_id`,`option_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `option_id` (`option_id`);

--
-- Indexes for table `user_occupation`
--
ALTER TABLE `user_occupation`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_category_unique` (`user_id`,`category_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `option_id` (`option_id`);

--
-- Indexes for table `user_preference_values`
--
ALTER TABLE `user_preference_values`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_preference_values_user_id` (`user_id`),
  ADD KEY `idx_user_preference_values_category_id` (`category_id`),
  ADD KEY `idx_user_preference_values_option_id` (`option_id`);

--
-- Indexes for table `user_progress`
--
ALTER TABLE `user_progress`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_range_preferences`
--
ALTER TABLE `user_range_preferences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_category_range_unique` (`user_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `user_red_flags`
--
ALTER TABLE `user_red_flags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_answer_unique` (`user_id`,`answer_id`),
  ADD KEY `fk_user_red_flags_user_id` (`user_id`),
  ADD KEY `fk_user_red_flags_answer_id` (`answer_id`);

--
-- Indexes for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_subscriptions_user_id` (`user_id`),
  ADD KEY `idx_user_subscriptions_plan_id` (`plan_id`),
  ADD KEY `idx_user_subscriptions_status` (`status`),
  ADD KEY `idx_user_subscriptions_dates` (`start_date`,`end_date`),
  ADD KEY `idx_user_active_subscription` (`user_id`,`status`,`end_date`);

--
-- Indexes for table `user_suggestions`
--
ALTER TABLE `user_suggestions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_suggestion` (`ai_character_id`,`requester_user_id`,`suggested_user_id`),
  ADD KEY `requester_user_id` (`requester_user_id`),
  ADD KEY `suggested_user_id` (`suggested_user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_creator`
--
ALTER TABLE `account_creator`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ai_capabilities`
--
ALTER TABLE `ai_capabilities`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `ai_characters`
--
ALTER TABLE `ai_characters`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `ai_chat_sessions`
--
ALTER TABLE `ai_chat_sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `ai_conversation_ratings`
--
ALTER TABLE `ai_conversation_ratings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ai_learning_data`
--
ALTER TABLE `ai_learning_data`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ai_messages`
--
ALTER TABLE `ai_messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `ai_message_reactions`
--
ALTER TABLE `ai_message_reactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `analytics_question`
--
ALTER TABLE `analytics_question`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `answers`
--
ALTER TABLE `answers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT for table `compatibility_results`
--
ALTER TABLE `compatibility_results`
  MODIFY `result_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `connections`
--
ALTER TABLE `connections`
  MODIFY `connection_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `couples`
--
ALTER TABLE `couples`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `daily_connection_usage`
--
ALTER TABLE `daily_connection_usage`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `education_levels`
--
ALTER TABLE `education_levels`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `feature_usage`
--
ALTER TABLE `feature_usage`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `group_chats`
--
ALTER TABLE `group_chats`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `group_chat_invitations`
--
ALTER TABLE `group_chat_invitations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `group_chat_messages`
--
ALTER TABLE `group_chat_messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `group_chat_participants`
--
ALTER TABLE `group_chat_participants`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `interests`
--
ALTER TABLE `interests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `interest_categories`
--
ALTER TABLE `interest_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `invitations`
--
ALTER TABLE `invitations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `job_titles`
--
ALTER TABLE `job_titles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `languages`
--
ALTER TABLE `languages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `mbti_ai_compatibility`
--
ALTER TABLE `mbti_ai_compatibility`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `mbti_compatibility`
--
ALTER TABLE `mbti_compatibility`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=257;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `message_attachments`
--
ALTER TABLE `message_attachments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `message_reactions`
--
ALTER TABLE `message_reactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `message_reads`
--
ALTER TABLE `message_reads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=365;

--
-- AUTO_INCREMENT for table `options`
--
ALTER TABLE `options`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `payment_webhooks`
--
ALTER TABLE `payment_webhooks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `people_pair`
--
ALTER TABLE `people_pair`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT for table `preference_categories`
--
ALTER TABLE `preference_categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `preference_options`
--
ALTER TABLE `preference_options`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=162;

--
-- AUTO_INCREMENT for table `profile_boosts`
--
ALTER TABLE `profile_boosts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `quiz_completion`
--
ALTER TABLE `quiz_completion`
  MODIFY `completion_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `quiz_sequences`
--
ALTER TABLE `quiz_sequences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `razorpay_orders`
--
ALTER TABLE `razorpay_orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subscription_payments`
--
ALTER TABLE `subscription_payments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tests`
--
ALTER TABLE `tests`
  MODIFY `test_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `test_progress`
--
ALTER TABLE `test_progress`
  MODIFY `progress_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=731;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=50;

--
-- AUTO_INCREMENT for table `user_ai_friends`
--
ALTER TABLE `user_ai_friends`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=363;

--
-- AUTO_INCREMENT for table `user_ai_preferences`
--
ALTER TABLE `user_ai_preferences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_badges`
--
ALTER TABLE `user_badges`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_chat_settings`
--
ALTER TABLE `user_chat_settings`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_details`
--
ALTER TABLE `user_details`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_education`
--
ALTER TABLE `user_education`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `user_interests`
--
ALTER TABLE `user_interests`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_job`
--
ALTER TABLE `user_job`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user_languages`
--
ALTER TABLE `user_languages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_matching_multi_preferences`
--
ALTER TABLE `user_matching_multi_preferences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_matching_preferences`
--
ALTER TABLE `user_matching_preferences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_mbti_assessment`
--
ALTER TABLE `user_mbti_assessment`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_multi_preferences`
--
ALTER TABLE `user_multi_preferences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_occupation`
--
ALTER TABLE `user_occupation`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user_preferences`
--
ALTER TABLE `user_preferences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=605;

--
-- AUTO_INCREMENT for table `user_preference_values`
--
ALTER TABLE `user_preference_values`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_progress`
--
ALTER TABLE `user_progress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=425;

--
-- AUTO_INCREMENT for table `user_range_preferences`
--
ALTER TABLE `user_range_preferences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_red_flags`
--
ALTER TABLE `user_red_flags`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `user_suggestions`
--
ALTER TABLE `user_suggestions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

-- --------------------------------------------------------

--
-- Structure for view `active_user_subscriptions`
--
DROP TABLE IF EXISTS `active_user_subscriptions`;

CREATE ALGORITHM=UNDEFINED DEFINER=`devuser`@`localhost` SQL SECURITY DEFINER VIEW `active_user_subscriptions`  AS SELECT `us`.`user_id` AS `user_id`, `us`.`id` AS `subscription_id`, `sp`.`plan_name` AS `plan_name`, `sp`.`display_name` AS `display_name`, `sp`.`features` AS `features`, `us`.`status` AS `status`, `us`.`start_date` AS `start_date`, `us`.`end_date` AS `end_date`, `us`.`auto_renew` AS `auto_renew`, (case when ((`us`.`end_date` > now()) and (`us`.`status` = 'active')) then 1 else 0 end) AS `is_currently_active` FROM (`user_subscriptions` `us` join `subscription_plans` `sp` on((`us`.`plan_id` = `sp`.`id`))) WHERE (`us`.`status` in ('active','pending')) ;

-- --------------------------------------------------------

--
-- Structure for view `user_current_plan_details`
--
DROP TABLE IF EXISTS `user_current_plan_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`devuser`@`localhost` SQL SECURITY DEFINER VIEW `user_current_plan_details`  AS SELECT `u`.`id` AS `user_id`, `u`.`username` AS `username`, `u`.`current_plan` AS `current_plan`, `u`.`subscription_status` AS `subscription_status`, `u`.`subscription_ends` AS `subscription_ends`, `u`.`is_verified` AS `is_verified`, `u`.`profile_boost_active` AS `profile_boost_active`, `u`.`profile_boost_ends` AS `profile_boost_ends`, `sp`.`features` AS `plan_features`, `sp`.`display_name` AS `plan_display_name` FROM ((`user` `u` left join `user_subscriptions` `us` on(((`u`.`id` = `us`.`user_id`) and (`us`.`status` = 'active')))) left join `subscription_plans` `sp` on((`us`.`plan_id` = `sp`.`id`))) ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_capabilities`
--
ALTER TABLE `ai_capabilities`
  ADD CONSTRAINT `ai_capabilities_ibfk_1` FOREIGN KEY (`ai_character_id`) REFERENCES `ai_characters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ai_chat_sessions`
--
ALTER TABLE `ai_chat_sessions`
  ADD CONSTRAINT `ai_chat_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `USER` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ai_chat_sessions_ibfk_2` FOREIGN KEY (`ai_character_id`) REFERENCES `ai_characters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ai_chat_sessions_ibfk_3` FOREIGN KEY (`ai_conversation_id`) REFERENCES `ai_conversations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  ADD CONSTRAINT `ai_conversations_ibfk_2` FOREIGN KEY (`ai_character_id`) REFERENCES `ai_characters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ai_conversation_ratings`
--
ALTER TABLE `ai_conversation_ratings`
  ADD CONSTRAINT `ai_conversation_ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `USER` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ai_conversation_ratings_ibfk_2` FOREIGN KEY (`ai_conversation_id`) REFERENCES `ai_conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ai_conversation_ratings_ibfk_3` FOREIGN KEY (`ai_character_id`) REFERENCES `ai_characters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ai_learning_data`
--
ALTER TABLE `ai_learning_data`
  ADD CONSTRAINT `ai_learning_data_ibfk_1` FOREIGN KEY (`ai_character_id`) REFERENCES `ai_characters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ai_learning_data_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `USER` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ai_learning_data_ibfk_3` FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ai_message_reactions`
--
ALTER TABLE `ai_message_reactions`
  ADD CONSTRAINT `ai_message_reactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `USER` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ai_message_reactions_ibfk_2` FOREIGN KEY (`ai_message_id`) REFERENCES `ai_messages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `answers`
--
ALTER TABLE `answers`
  ADD CONSTRAINT `answers_question_id_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`);

--
-- Constraints for table `compatibility_results`
--
ALTER TABLE `compatibility_results`
  ADD CONSTRAINT `compatibility_results_test_id_tests_test_id_fk` FOREIGN KEY (`test_id`) REFERENCES `tests` (`test_id`),
  ADD CONSTRAINT `fk_user_1_id` FOREIGN KEY (`user_1_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `fk_user_2_id` FOREIGN KEY (`user_2_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `connections`
--
ALTER TABLE `connections`
  ADD CONSTRAINT `connections_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `connections_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD CONSTRAINT `conversation_participants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversation_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `couples`
--
ALTER TABLE `couples`
  ADD CONSTRAINT `couples_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `couples_ibfk_2` FOREIGN KEY (`couple_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `daily_connection_usage`
--
ALTER TABLE `daily_connection_usage`
  ADD CONSTRAINT `fk_daily_connection_usage_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `feature_usage`
--
ALTER TABLE `feature_usage`
  ADD CONSTRAINT `fk_feature_usage_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `group_chats`
--
ALTER TABLE `group_chats`
  ADD CONSTRAINT `group_chats_ibfk_1` FOREIGN KEY (`ai_character_id`) REFERENCES `ai_characters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_chats_ibfk_2` FOREIGN KEY (`created_by_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `group_chat_invitations`
--
ALTER TABLE `group_chat_invitations`
  ADD CONSTRAINT `group_chat_invitations_ibfk_1` FOREIGN KEY (`ai_character_id`) REFERENCES `ai_characters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_chat_invitations_ibfk_2` FOREIGN KEY (`initiator_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_chat_invitations_ibfk_3` FOREIGN KEY (`invited_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `group_chat_messages`
--
ALTER TABLE `group_chat_messages`
  ADD CONSTRAINT `group_chat_messages_ibfk_1` FOREIGN KEY (`group_chat_id`) REFERENCES `group_chats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_chat_messages_ibfk_2` FOREIGN KEY (`sender_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_chat_messages_ibfk_3` FOREIGN KEY (`sender_ai_id`) REFERENCES `ai_characters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `group_chat_participants`
--
ALTER TABLE `group_chat_participants`
  ADD CONSTRAINT `group_chat_participants_ibfk_1` FOREIGN KEY (`group_chat_id`) REFERENCES `group_chats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_chat_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `interests`
--
ALTER TABLE `interests`
  ADD CONSTRAINT `interests_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `interest_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `invitations`
--
ALTER TABLE `invitations`
  ADD CONSTRAINT `fk_inviter_id` FOREIGN KEY (`inviter_id`) REFERENCES `user` (`id`),
  ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`reply_to_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `message_attachments`
--
ALTER TABLE `message_attachments`
  ADD CONSTRAINT `message_attachments_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `message_reactions`
--
ALTER TABLE `message_reactions`
  ADD CONSTRAINT `message_reactions_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `message_reads`
--
ALTER TABLE `message_reads`
  ADD CONSTRAINT `message_reads_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_reads_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `preference_options`
--
ALTER TABLE `preference_options`
  ADD CONSTRAINT `preference_options_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `preference_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `profile_boosts`
--
ALTER TABLE `profile_boosts`
  ADD CONSTRAINT `fk_profile_boosts_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `questions_test_id_tests_test_id_fk` FOREIGN KEY (`test_id`) REFERENCES `tests` (`test_id`);

--
-- Constraints for table `quiz_completion`
--
ALTER TABLE `quiz_completion`
  ADD CONSTRAINT `quiz_completion_test_id_tests_test_id_fk` FOREIGN KEY (`test_id`) REFERENCES `tests` (`test_id`),
  ADD CONSTRAINT `quiz_completion_user_id_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `razorpay_orders`
--
ALTER TABLE `razorpay_orders`
  ADD CONSTRAINT `razorpay_orders_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`),
  ADD CONSTRAINT `razorpay_orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subscription_payments`
--
ALTER TABLE `subscription_payments`
  ADD CONSTRAINT `fk_subscription_payments_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`id`),
  ADD CONSTRAINT `fk_subscription_payments_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `test_progress`
--
ALTER TABLE `test_progress`
  ADD CONSTRAINT `test_progress_question_id_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`),
  ADD CONSTRAINT `test_progress_selected_answer_id_answers_id_fk` FOREIGN KEY (`selected_answer_id`) REFERENCES `answers` (`id`),
  ADD CONSTRAINT `test_progress_test_id_tests_test_id_fk` FOREIGN KEY (`test_id`) REFERENCES `tests` (`test_id`),
  ADD CONSTRAINT `test_progress_user_id_user_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`);

--
-- Constraints for table `user_ai_friends`
--
ALTER TABLE `user_ai_friends`
  ADD CONSTRAINT `fk_user_ai_friends_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_ai_preferences`
--
ALTER TABLE `user_ai_preferences`
  ADD CONSTRAINT `user_ai_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `USER` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_ai_preferences_ibfk_2` FOREIGN KEY (`ai_character_id`) REFERENCES `ai_characters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD CONSTRAINT `fk_user_badges_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_chat_settings`
--
ALTER TABLE `user_chat_settings`
  ADD CONSTRAINT `user_chat_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_education`
--
ALTER TABLE `user_education`
  ADD CONSTRAINT `fk_education_level` FOREIGN KEY (`education_level_id`) REFERENCES `education_levels` (`id`);

--
-- Constraints for table `user_interests`
--
ALTER TABLE `user_interests`
  ADD CONSTRAINT `user_interests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_interests_ibfk_2` FOREIGN KEY (`interest_id`) REFERENCES `interests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_job`
--
ALTER TABLE `user_job`
  ADD CONSTRAINT `fk_job_title` FOREIGN KEY (`job_title_id`) REFERENCES `job_titles` (`id`);

--
-- Constraints for table `user_matching_multi_preferences`
--
ALTER TABLE `user_matching_multi_preferences`
  ADD CONSTRAINT `user_matching_multi_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_matching_multi_preferences_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `preference_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_matching_multi_preferences_ibfk_3` FOREIGN KEY (`option_id`) REFERENCES `preference_options` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_matching_preferences`
--
ALTER TABLE `user_matching_preferences`
  ADD CONSTRAINT `user_matching_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_matching_preferences_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `preference_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_mbti_assessment`
--
ALTER TABLE `user_mbti_assessment`
  ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_multi_preferences`
--
ALTER TABLE `user_multi_preferences`
  ADD CONSTRAINT `user_multi_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_multi_preferences_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `preference_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_multi_preferences_ibfk_3` FOREIGN KEY (`option_id`) REFERENCES `preference_options` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_preferences`
--
ALTER TABLE `user_preferences`
  ADD CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_preferences_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `preference_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_preferences_ibfk_3` FOREIGN KEY (`option_id`) REFERENCES `preference_options` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_preference_values`
--
ALTER TABLE `user_preference_values`
  ADD CONSTRAINT `fk_user_preference_values_category` FOREIGN KEY (`category_id`) REFERENCES `preference_categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_preference_values_option` FOREIGN KEY (`option_id`) REFERENCES `preference_options` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_preference_values_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_range_preferences`
--
ALTER TABLE `user_range_preferences`
  ADD CONSTRAINT `user_range_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_range_preferences_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `preference_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_red_flags`
--
ALTER TABLE `user_red_flags`
  ADD CONSTRAINT `fk_user_red_flags_answer_id` FOREIGN KEY (`answer_id`) REFERENCES `answers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_red_flags_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_subscriptions`
--
ALTER TABLE `user_subscriptions`
  ADD CONSTRAINT `fk_user_subscriptions_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`),
  ADD CONSTRAINT `fk_user_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_suggestions`
--
ALTER TABLE `user_suggestions`
  ADD CONSTRAINT `user_suggestions_ibfk_1` FOREIGN KEY (`ai_character_id`) REFERENCES `ai_characters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_suggestions_ibfk_2` FOREIGN KEY (`requester_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_suggestions_ibfk_3` FOREIGN KEY (`suggested_user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
