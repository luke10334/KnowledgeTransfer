#!/usr/bin/env python3
"""
Demo Data Creation Script for Knowledge Transfer Platform
"""

import sqlite3
import os
from datetime import datetime

def create_demo_database():
    """Create SQLite database with demo data"""
    
    print("🚀 Creating demo database...")
    
    # Remove existing database
    if os.path.exists("knowledge_platform.db"):
        os.remove("knowledge_platform.db")
        print("🗑️  Removed existing database")
    
    # Create new database
    conn = sqlite3.connect("knowledge_platform.db")
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        level INTEGER NOT NULL,
        is_hr BOOLEAN DEFAULT FALSE,
        full_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create artifacts table  
    cursor.execute('''
    CREATE TABLE artifacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        access_level INTEGER NOT NULL,
        is_hr_only BOOLEAN DEFAULT FALSE,
        tags TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create access logs table
    cursor.execute('''
    CREATE TABLE access_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        artifact_id INTEGER,
        action TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (artifact_id) REFERENCES artifacts (id)
    )
    ''')
    
    print("✅ Database tables created successfully!")
    
    # Insert demo users
    demo_users = [
        ('demo_ceo', 'demo123', 'CEO', 100, False, 'John Smith'),
        ('demo_engineer', 'demo123', 'ENGINEER', 40, False, 'Alice Johnson'), 
        ('demo_intern', 'demo123', 'INTERN', 10, False, 'Bob Wilson'),
    ]
    
    cursor.executemany('''
    INSERT INTO users (username, password_hash, role, level, is_hr, full_name)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', demo_users)
    
    print("✅ Demo users created successfully!")
    
    # Insert demo artifacts
    demo_artifacts = [
        ('Company Onboarding Guide', 'Welcome to the company! This guide covers basic policies and procedures.', 'DOCUMENTATION', 10, False, 'onboarding,basics'),
        ('Python Development Standards', 'Our coding standards for Python development including PEP 8 compliance.', 'DOCUMENTATION', 30, False, 'python,coding,standards'),
        ('Architecture Decision Record', 'Decision to migrate from monolith to microservices architecture.', 'ARCHITECTURE_DOC', 60, False, 'architecture,microservices'),
        ('Strategic Product Roadmap', 'Confidential 12-month product strategy and financial projections.', 'STRATEGY', 80, False, 'strategy,roadmap,confidential'),
    ]
    
    cursor.executemany('''
    INSERT INTO artifacts (title, content, type, access_level, is_hr_only, tags)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', demo_artifacts)
    
    print("✅ Demo artifacts created successfully!")
    
    conn.commit()
    conn.close()
    
    print("\n🎉 Demo database setup completed!")
    print("Demo users available:")
    print("- demo_ceo / demo123 (CEO - Full access)")
    print("- demo_engineer / demo123 (Engineer - Standard access)")
    print("- demo_intern / demo123 (Intern - Limited access)")

if __name__ == "__main__":
    create_demo_database()
