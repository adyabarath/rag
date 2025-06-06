from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from datetime import datetime
import os
from dotenv import load_dotenv
from bson import ObjectId
from openai import AzureOpenAI
import lancedb
import numpy as np
import pandas as pd
import pyarrow as pa
from io import BytesIO
import cohere
from typing import List, Dict, Any
from utils import get_text_embedding, rerank_documents, generate_advanced_reasoning
# Load environment variables
STORAGE_PATH = r"D:\project-bolt-sb1-zlzgvffc\project2\backend\lancedb"
load_dotenv()
app = Flask(__name__)

def format_session(session):
    """Format session document for JSON response"""
    return {
        'id': str(session['_id']),
        'name': session['name'],
        'messages': session['messages'],
        'created_at': session['created_at'].isoformat(),
        'updated_at': session['updated_at'].isoformat()
    }

@app.route('/api/sessions', methods=['POST'])
def create_session():
    """Create a new chat session"""
    try:
        session = {
            'name': f'Chat {datetime.now().strftime("%Y-%m-%d %H:%M")}',
            'messages': [],
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        }
        
        result = mongo.db.sessions.insert_one(session)
        session['_id'] = result.inserted_id
        
        return jsonify({
            'status': 'success',
            'session': format_session(session)
        }), 201
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    """Get all sessions"""
    try:
        # Get all sessions and sort by updated_at descending
        sessions = list(mongo.db.sessions.find().sort('updated_at', -1))
        formatted_sessions = [format_session(session) for session in sessions]
        
        return jsonify({
            'status': 'success',
            'sessions': formatted_sessions
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    """Delete a chat session"""
    try:
        result = mongo.db.sessions.delete_one({'_id': ObjectId(session_id)})
        
        if result.deleted_count == 0:
            return jsonify({
                'status': 'error',
                'message': 'Session not found'
            }), 404
            
        return jsonify({
            'status': 'success',
            'message': 'Session deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/sessions/<session_id>/messages', methods=['POST'])
def add_message(session_id):
    """Add a message to a session with dynamic RAG retrieval"""
    try:
        # Validate session exists
        session = mongo.db.sessions.find_one({'_id': ObjectId(session_id)})
        if not session:
            return jsonify({
                'status': 'error',
                'message': 'Session not found'
            }), 404

        # Get user message from request
        message = request.json.get('message')
        current_time = datetime.now()
        
        # Create user message
        user_message = {
            'id': str(ObjectId()),
            'content': message,
            'role': 'user',
            'timestamp': current_time.isoformat()
        }
        
        # Get conversation history (last 5 messages max)
        conversation_history = []
        if 'messages' in session:
            # Get the last 5 messages max from the session
            conversation_history = session.get('messages', [])[-5:]
        
        # RAG retrieval process
        db = lancedb.connect(STORAGE_PATH)
        table = db.open_table("pdf_contents6")
        
        # Get embedding for user query
        query_embedding = get_text_embedding(message)
        
        # Vector search to retrieve documents
        retrieved_docs = (
            table.search(query_embedding, vector_column_name="embedding")
            .limit(10)
            .to_list()
        )
        
        # Rerank documents
        reranked_docs, rerank_results = rerank_documents(message, retrieved_docs, top_k=5)
 
        # Format the contexts from reranked documents
        contexts = []
        for i, result in enumerate(rerank_results.results[:3]):  # Get top 3 results for context display
            # Access the original document from retrieved_docs using the index from rerank results
            original_doc = retrieved_docs[result.index]
            contexts.append({
                'id': str(ObjectId()),
                'content': original_doc.get("text", ""),  # Get text content from original document
                'relevance_score': float(result.relevance_score),  # Use the relevance_score from rerank result
                'source': original_doc.get("document_name", "Navy Regulations Part II")
            })
        
        # Clean reranked documents to remove embeddings before passing to reasoning model
        clean_docs = []
        for doc in reranked_docs:
            # Create a clean version of each document without embeddings
            clean_doc = {
                'text': doc.get('text', ''),
                'document_name': doc.get('document_name', ''),
                'relevance_score': doc.get('relevance_score', 0.0),
                'rank': doc.get('rank', 0)
            }
            # Add any other fields you need except embeddings
            clean_docs.append(clean_doc)
        print(clean_docs)
        # Generate AI response using advanced reasoning with conversation history
        response = generate_advanced_reasoning(
            message,           # Current user query
            clean_docs,     # Retrieved and reranked documents
            conversation_history  # Pass conversation history
        )
        
        # Create AI response with dynamic contexts
        ai_response = {
            'id': str(ObjectId()),
            'content': response,
            'role': 'assistant',
            'timestamp': current_time.isoformat(),
            'contexts': contexts  # Use dynamically generated contexts
        }
        
        # Update session with new messages
        mongo.db.sessions.update_one(
            {'_id': ObjectId(session_id)},
            {
                '$push': {
                    'messages': {
                        '$each': [user_message, ai_response]
                    }
                },
                '$set': {'updated_at': current_time}
            }
        )
        
        return jsonify({
            'status': 'success',
            'messages': [user_message, ai_response]
        }), 200
        
    except Exception as e:
        # Log the error for debugging
        print(f"Error in add_message: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    

if __name__ == '__main__':
    app.run(debug=True, port=5000)
