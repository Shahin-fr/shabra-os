'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useIsMobile } from '../../../hooks/useMediaQuery';

/**
 * DocumentationSection Component - Professional IDE-like Interface
 * 
 * A sophisticated showcase of product design documents with interactive tabs,
 * markdown rendering, and smooth animations for the InstaPulse module.
 */
export default function DocumentationSection() {
  const isMobile = useIsMobile();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [activeTab, setActiveTab] = useState('00_Project_Overview.md');

  const tabs = [
    {
      id: '00_Project_Overview.md',
      label: '00_Project_Overview.md',
      icon: '📋'
    },
    {
      id: '01_Discovery_and_Foundation.md',
      label: '01_Discovery_and_Foundation.md',
      icon: '🔍'
    },
    {
      id: '02_Vision_and_Architecture.md',
      label: '02_Vision_and_Architecture.md',
      icon: '🏗️'
    }
  ];

  // Hardcoded markdown content for each tab
  const getTabContent = (tabId: string) => {
    switch (tabId) {
      case '00_Project_Overview.md':
        return `# Project Overview: InstaPulse Module

## Executive Summary

InstaPulse is a real-time communication and collaboration module designed to replace traditional instant messaging platforms with a business-focused, productivity-oriented solution. Built as part of the Shabra OS ecosystem, InstaPulse addresses the critical need for seamless, context-aware communication within professional teams.

## Problem Statement

Modern teams struggle with:
- **Tool Fragmentation**: Switching between multiple communication platforms
- **Context Loss**: Important information buried in endless message threads
- **Integration Gaps**: Disconnected communication from project management and documentation
- **Notification Fatigue**: Overwhelming alerts from various sources

## Solution Overview

InstaPulse provides:
- **Unified Communication Hub**: All team communication in one place
- **Context-Aware Messaging**: Messages linked to projects, tasks, and documents
- **Smart Notifications**: AI-powered priority filtering
- **Seamless Integration**: Native connection with other Shabra OS modules

## Key Features

### Core Communication
- Real-time messaging with rich media support
- Thread-based conversations for organized discussions
- Voice and video calling integration
- File sharing with version control

### Productivity Features
- Task integration from project management
- Document collaboration in real-time
- Meeting scheduling and recording
- Status updates and availability management

### Advanced Capabilities
- AI-powered message summarization
- Smart search across all conversations
- Automated workflow triggers
- Custom notification rules

## Technical Architecture

- **Frontend**: React with TypeScript
- **Backend**: Node.js with Express
- **Real-time**: WebSocket connections
- **Database**: PostgreSQL with Redis caching
- **File Storage**: AWS S3 with CDN

## Success Metrics

- 50% reduction in time spent switching between tools
- 30% increase in team collaboration efficiency
- 90% user satisfaction rating
- 25% decrease in missed important messages

## Timeline

- **Phase 1**: Core messaging functionality (4 weeks)
- **Phase 2**: Advanced features and integrations (6 weeks)
- **Phase 3**: AI capabilities and optimization (4 weeks)
- **Phase 4**: Testing and deployment (2 weeks)`;

      case '01_Discovery_and_Foundation.md':
        return `# Discovery and Foundation: InstaPulse Module

## User Research Insights

### Primary User Personas

#### 1. Project Manager (Sarah)
- **Pain Points**: Managing multiple communication channels, losing context in conversations
- **Goals**: Centralized team communication, clear project visibility
- **Behaviors**: Prefers structured communication, needs audit trails

#### 2. Developer (Ahmed)
- **Pain Points**: Interruptions from non-urgent messages, difficulty finding technical discussions
- **Goals**: Focused work time, easy access to relevant technical conversations
- **Behaviors**: Values efficiency, prefers async communication

#### 3. Designer (Layla)
- **Pain Points**: Difficulty sharing visual feedback, version control issues
- **Goals**: Seamless design collaboration, clear feedback loops
- **Behaviors**: Visual communication preference, needs file sharing

### Competitive Analysis

#### Slack
- **Strengths**: Wide adoption, extensive integrations
- **Weaknesses**: Information overload, poor search, expensive
- **Opportunity**: Better organization and context awareness

#### Microsoft Teams
- **Strengths**: Office 365 integration, video calling
- **Weaknesses**: Complex interface, poor mobile experience
- **Opportunity**: Simplified, mobile-first approach

#### Discord
- **Strengths**: Great voice features, community building
- **Weaknesses**: Not business-focused, limited file management
- **Opportunity**: Professional features and security

## Technical Requirements

### Performance Requirements
- **Message Delivery**: < 100ms latency
- **Concurrent Users**: Support 1000+ simultaneous connections
- **File Upload**: Support files up to 100MB
- **Search**: Sub-second search across 1M+ messages

### Security Requirements
- **End-to-End Encryption**: All messages encrypted
- **Data Retention**: Configurable message retention policies
- **Access Control**: Role-based permissions
- **Compliance**: GDPR and SOC 2 compliance

### Integration Requirements
- **Project Management**: Direct task creation from messages
- **Documentation**: Link messages to specific documents
- **Calendar**: Meeting scheduling integration
- **File Storage**: Seamless file sharing and versioning

## User Journey Mapping

### Current State (Pain Points)
1. **Message Discovery**: User receives notification → Opens app → Scrolls through messages → Finds relevant context
2. **File Sharing**: User needs to share file → Switches to file manager → Uploads to cloud → Shares link in chat
3. **Task Creation**: Discussion in chat → User switches to project tool → Creates task → Returns to chat

### Future State (With InstaPulse)
1. **Message Discovery**: User receives smart notification → Opens app → Sees prioritized messages with context
2. **File Sharing**: User drags file into chat → File automatically uploaded and linked to conversation
3. **Task Creation**: Discussion in chat → User creates task directly from message → Task appears in project tool

## Success Criteria

### User Experience
- **Onboarding Time**: < 5 minutes to first meaningful interaction
- **Learning Curve**: 80% of features discoverable without training
- **User Satisfaction**: > 4.5/5 rating
- **Daily Active Users**: > 90% of team members

### Business Impact
- **Productivity Gain**: 25% reduction in communication overhead
- **Tool Consolidation**: Replace 3+ communication tools
- **Cost Savings**: 40% reduction in communication tool costs
- **Team Alignment**: 50% improvement in project visibility

## Risk Assessment

### Technical Risks
- **Scalability**: Real-time messaging at scale
- **Mitigation**: Microservices architecture, horizontal scaling

### User Adoption Risks
- **Change Resistance**: Teams comfortable with existing tools
- **Mitigation**: Gradual migration, feature parity, training

### Security Risks
- **Data Breach**: Sensitive business information exposure
- **Mitigation**: End-to-end encryption, regular security audits

## Next Steps

1. **Prototype Development**: Create interactive wireframes
2. **Technical Architecture**: Finalize system design
3. **Security Review**: Conduct security assessment
4. **User Testing**: Validate concepts with target users`;

      case '02_Vision_and_Architecture.md':
        return `# Vision and Architecture: InstaPulse Module

## Product Vision

> "To create the most intuitive, context-aware communication platform that seamlessly integrates with every aspect of team productivity, eliminating the friction between communication and work execution."

## Core Principles

### 1. Context-First Communication
Every message, file, and interaction is automatically linked to relevant projects, tasks, and documents, providing immediate context without manual organization.

### 2. Intelligence-Driven Experience
AI-powered features that learn from team patterns to surface relevant information, suggest actions, and reduce cognitive load.

### 3. Seamless Integration
Native connectivity with all Shabra OS modules, creating a unified workspace where communication and productivity tools work as one.

## System Architecture

### High-Level Architecture

\`\`\`mermaid
graph TB
    A[Client Applications] --> B[API Gateway]
    B --> C[Authentication Service]
    B --> D[Message Service]
    B --> E[File Service]
    B --> F[Notification Service]
    B --> G[AI Service]
    
    D --> H[(Message Database)]
    E --> I[(File Storage)]
    F --> J[(Notification Queue)]
    G --> K[(AI Models)]
    
    D --> L[Real-time Engine]
    L --> M[WebSocket Connections]
    
    N[External Integrations] --> B
    O[Shabra OS Modules] --> B
\`\`\`

### Microservices Architecture

#### 1. Message Service
- **Purpose**: Handle all messaging operations
- **Technology**: Node.js with Express
- **Database**: PostgreSQL with Redis caching
- **Features**: Real-time delivery, message threading, search

#### 2. File Service
- **Purpose**: Manage file uploads, storage, and sharing
- **Technology**: Node.js with AWS SDK
- **Storage**: AWS S3 with CloudFront CDN
- **Features**: Version control, access permissions, virus scanning

#### 3. Notification Service
- **Purpose**: Smart notification management
- **Technology**: Node.js with Bull Queue
- **Features**: Priority filtering, delivery optimization, user preferences

#### 4. AI Service
- **Purpose**: Intelligent features and automation
- **Technology**: Python with FastAPI
- **Features**: Message summarization, smart suggestions, content analysis

## Database Design

### Core Tables

#### Messages Table
\`\`\`sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    channel_id UUID NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    parent_id UUID REFERENCES messages(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);
\`\`\`

#### Channels Table
\`\`\`sql
CREATE TABLE channels (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    channel_type VARCHAR(20) DEFAULT 'public',
    project_id UUID,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    settings JSONB
);
\`\`\`

#### Files Table
\`\`\`sql
CREATE TABLE files (
    id UUID PRIMARY KEY,
    message_id UUID REFERENCES messages(id),
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    uploaded_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

## API Design

### RESTful Endpoints

#### Messages
\`\`\`typescript
// Get messages for a channel
GET /api/v1/channels/{channelId}/messages
Query params: limit, offset, before, after

// Send a message
POST /api/v1/channels/{channelId}/messages
Body: { content: string, message_type?: string, parent_id?: string }

// Update a message
PUT /api/v1/messages/{messageId}
Body: { content: string }

// Delete a message
DELETE /api/v1/messages/{messageId}
\`\`\`

#### Files
\`\`\`typescript
// Upload a file
POST /api/v1/files/upload
Body: FormData with file

// Get file info
GET /api/v1/files/{fileId}

// Download file
GET /api/v1/files/{fileId}/download
\`\`\`

### WebSocket Events

\`\`\`typescript
// Message events
interface MessageEvent {
  type: 'message.created' | 'message.updated' | 'message.deleted';
  data: {
    message: Message;
    channel_id: string;
  };
}

// Typing indicators
interface TypingEvent {
  type: 'user.typing' | 'user.stopped_typing';
  data: {
    user_id: string;
    channel_id: string;
  };
}
\`\`\`

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Role-Based Access**: Granular permissions
- **OAuth Integration**: Support for external identity providers

### Data Protection
- **Encryption at Rest**: AES-256 for database
- **Encryption in Transit**: TLS 1.3 for all communications
- **End-to-End Encryption**: Optional for sensitive conversations

### Compliance
- **GDPR**: Right to deletion, data portability
- **SOC 2**: Security controls and monitoring
- **ISO 27001**: Information security management

## Performance Optimization

### Caching Strategy
- **Redis**: Message caching, session storage
- **CDN**: Static file delivery
- **Database**: Query optimization, indexing

### Scalability
- **Horizontal Scaling**: Microservices architecture
- **Load Balancing**: Multiple service instances
- **Database Sharding**: Partition by organization

## Monitoring & Analytics

### Key Metrics
- **Performance**: Response time, throughput, error rate
- **Usage**: Active users, message volume, feature adoption
- **Business**: User engagement, retention, satisfaction

### Tools
- **APM**: New Relic or DataDog
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Metrics**: Prometheus with Grafana

## Deployment Strategy

### Infrastructure
- **Cloud Provider**: AWS
- **Containerization**: Docker with Kubernetes
- **CI/CD**: GitHub Actions with automated testing

### Environment Strategy
- **Development**: Local development with Docker Compose
- **Staging**: Production-like environment for testing
- **Production**: Multi-region deployment with failover

## Future Roadmap

### Phase 1: Core Features (Months 1-3)
- Basic messaging functionality
- File sharing and storage
- User management and permissions

### Phase 2: Advanced Features (Months 4-6)
- AI-powered features
- Advanced integrations
- Mobile applications

### Phase 3: Enterprise Features (Months 7-9)
- Advanced security features
- Compliance tools
- Enterprise integrations

### Phase 4: Intelligence (Months 10-12)
- Machine learning insights
- Predictive features
- Advanced automation`;

      default:
        return '';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section 
      ref={ref}
      className="relative py-20 px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden"
    >
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F5F5] mb-6">
            فراتر از کد: فرآیند طراحی و معماری محصول
          </h2>
          <p className="text-lg sm:text-xl text-[#A1A1A1] max-w-4xl mx-auto leading-relaxed">
            یک نگاه عمیق به مستندات طراحی ماژول InstaPulse، از تعریف مسئله تا طراحی API.
          </p>
        </motion.div>

        {/* IDE-like Window Container */}
        <motion.div 
          className="relative bg-zinc-900 rounded-2xl border border-zinc-700 shadow-2xl overflow-hidden"
          variants={itemVariants}
          dir="ltr"
        >
          {/* Window Header */}
          <div className="bg-zinc-800 border-b border-zinc-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm text-zinc-400 font-mono">
                  InstaPulse Documentation
                </span>
              </div>
              <div className="text-xs text-zinc-500 font-mono">
                v1.0.0
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-zinc-800 border-b border-zinc-700">
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  className={`
                    flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-all duration-300 whitespace-nowrap
                    ${activeTab === tab.id 
                      ? 'text-[#E000A0] border-b-2 border-[#E000A0] bg-zinc-700/50' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/30'
                    }
                  `}
                  onClick={() => setActiveTab(tab.id)}
                  variants={tabVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-mono">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                className="max-h-[500px] overflow-y-auto"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.3 }}
              >
                <div className="p-8">
                  <div className="prose prose-invert prose-zinc max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-mono leading-relaxed">
                      {getTabContent(activeTab)}
                    </pre>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-r from-[#E000A0]/5 via-transparent to-[#8B5CF6]/5" />
        </motion.div>

      </motion.div>
    </section>
  );
}
