from openai import AzureOpenAI
import lancedb
import cohere
import base64
AZURE_API_KEY = "c18c9011aa0746d78cd93f07da587452"
AZURE_ENDPOINT = "https://gpt4o-adya.openai.azure.com/"
API_VERSION = "2024-02-01"

# Initialize Azure OpenAI Client
client = AzureOpenAI(
    api_key=AZURE_API_KEY,
    api_version=API_VERSION,
    azure_endpoint=AZURE_ENDPOINT
)

def get_text_embedding(text):
    """
    Generate embeddings for the given text using Azure OpenAI
    
    Args:
        text (str): Text to generate embeddings for
        
    Returns:
        list: The embedding vector
    """
    try:
        response = client.embeddings.create(
            input=text,
            model="text_embedding_3_large_deployment",
            dimensions=1536
        )
        result = response.model_dump()
        return result["data"][0]["embedding"]
    except Exception as e:
        print(f"Error generating embedding: {str(e)}")
        raise

def encode_image_to_base64(image_path):
    """Encode image to base64"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')
    

def generate_advanced_reasoning(query, retrieved_docs, past_messages):
    """Advanced Reasoning Generation using Azure OpenAI that matches the exact format shown in the app screenshot"""

    reasoning_prompt_template = f"""
# Navy Regulations Part II AI Assistant - Response Generation Prompt

## System Role and Context
You are an advanced AI assistant specialized in interpreting and explaining Navy Regulations Part II for Indian Naval personnel. Your primary objective is to provide precise, clear, and contextually accurate responses to regulatory queries while maintaining a professional and supportive tone.

## Response Structure Requirements
Your responses MUST follow this exact structure to ensure proper rendering in the frontend application:

1. **Always start with a main heading (level 1)** - Use only a single # for the main title
2. **Use subheadings (level 2)** - Use ## for each distinct section
3. **Format key information properly** - Use **bold** for important terms and *italics* for emphasis
4. **Use proper list formatting** - Start bullet points with "- " and numbered lists with "1. " etc.
5. **Keep paragraphs well-spaced** - Use double line breaks between paragraphs
6. **Keep responses concise** - Focus on clarity and precision over verbosity

## Response Sections Structure
Every response MUST include these sections in this exact order:

# Response to Your Query

## Direct Answer
[Provide a clear, concise answer to the specific question in 1-3 sentences]

## Detailed Explanation
[Provide a comprehensive breakdown of the relevant regulation]
- [Include key points as bullet lists]
- [Break down complex concepts step by step]
- [Use clear, plain language]

## Regulatory References
- **Primary Reference**: [Specific Regulation Section and Article]
- **Related Regulations**: [Any additional relevant sections]

## Practical Application
[Explain how this regulation applies in practical scenarios]
[Include any important contextual information]

## Important Notes
[Include any warnings, nuances, or special considerations]
[Recommend consulting legal officers if appropriate]

## Response Guidelines

### Formatting Rules
- Use bold (**text**) for regulation numbers, section names, and key terms
- Use italics (*text*) for emphasis and important points
- Use bullet points for lists of related items
- Use numbered lists for sequential steps or procedures
- Break up long paragraphs into smaller, digestible chunks
- Keep sentences clear and concise

### Content Rules
- Answer directly based on Navy Regulations Part II
- Cite specific regulation sections and articles
- Provide practical context for abstract rules
- Explain rationale behind regulations when appropriate
- Keep information factual and avoid personal opinions
- Acknowledge ambiguity when regulations aren't clear

### Response Style
- Maintain a professional, authoritative tone
- Be conversational but not casual
- Stay neutral and objective
- Focus on being helpful and informative
- Prioritize accuracy over comprehensiveness

## Input Processing Variables
- User Query: {query}
- Retrieved Documents: {retrieved_docs}
- Conversation History: {past_messages}

Ensure every response follows this structure and formatting guidelines precisely to maintain consistency and readability in the application interface.
"""

    # Build full message history including system prompt and prior chat
    full_messages = [
        {
            "role": "system",
            "content": """You are an advanced multi-modal research assistant with expertise in comprehensive information synthesis.
            Analyze retrieved documents with critical thinking, provide nuanced insights, and generate responses that
            are precise, contextually rich, and intellectually rigorous. """
        }
    ]

    full_messages.append({
        "role": "user",
        "content": reasoning_prompt_template
    })

    response = client.chat.completions.create(
        model="gpt4o_deployment",  # Replace with your Azure deployment name
        messages=full_messages,
        temperature=0.6
    )

    result=response.choices[0].message.content
    final_cleaned_result=result.replace("```", "")
    return final_cleaned_result


def rerank_documents(query: str, documents: list[dict[any, any]], top_k: int = 5) -> tuple[list[dict[any, any]], any]:
    """
    Rerank documents using Cohere API
    
    Args:
        query: The user query
        documents: List of documents retrieved from vector DB
        top_k: Number of top documents to return after reranking
        
    Returns:
        Tuple containing (list of reranked documents, original rerank_results object)
    """
    try:
        # Initialize Cohere client
        co = cohere.Client("E2ObARuULPkriieuZnzvi8JTdX8pxKukJ1L5n1sv")
        
        # Extract text from documents for reranking
        docs_for_rerank = [doc.get("text", "") for doc in documents]
        
        # Call Cohere rerank API
        rerank_results = co.rerank(
            query=query,
            documents=docs_for_rerank,
            model="rerank-english-v3.0",
            top_n=top_k
        )
        
        # Map results back to original documents
        reranked_docs = []
        for i, result in enumerate(rerank_results.results, 1):
            # Get the index of the document in the original list
            idx = result.index
            
            # Create a copy of the original document
            document = documents[idx].copy()
            
            # Add relevance score to the document
            document['relevance_score'] = result.relevance_score
            
            # Add a custom rank (1-based indexing)
            document['rank'] = i
            
            reranked_docs.append(document)
        
        return reranked_docs, rerank_results
        
    except Exception as e:
        print(f"Error in reranking: {e}")
        # Fallback to original documents if reranking fails
        return documents[:top_k], None