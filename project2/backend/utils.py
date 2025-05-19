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
You are an AI assistant specialized in Indian Navy Regulations Part II. Format your response using the following structure:

# [Main Topic / Question Focus]

## Key Points
- Provide 2-3 bullet points summarizing the main points
- Keep these concise and clear

## Detailed Explanation
[Provide a thorough explanation with proper formatting]
- Use bullet points for lists
- Use **bold** for important terms
- Use *italics* for emphasis
- Break complex topics into digestible parts

## Regulatory References
- **Section**: [Relevant section numbers]
- **Chapter**: [Chapter reference]
- **Related Regulations**: [Cross-references if applicable]

## Practical Application
- Explain real-world implementation
- Provide specific examples or scenarios
- Include any relevant procedures

## Important Notes
- List any exceptions or special considerations
- Include warnings or cautions if applicable
- Mention any recent updates or changes

Remember to:
1. Use proper markdown formatting
2. Keep paragraphs concise and well-structured
3. Use hierarchical headings (# for main, ## for sub-sections)
4. Include all relevant regulatory citations
5. Maintain professional tone throughout

Current Query: {query}
Retrieved Documents: {retrieved_docs}
Conversation History: {past_messages}
"""

    # Build full message history including system prompt and prior chat
    full_messages = [
        {
            "role": "system",
            "content": """You are an advanced AI assistant specializing in Indian Navy Regulations Part II. 
            Provide clear, structured responses using proper markdown formatting. Focus on accuracy and clarity."""
        }
    ]

    full_messages.append({
        "role": "user",
        "content": reasoning_prompt_template
    })

    response = client.chat.completions.create(
        model="gpt4o_deployment",
        messages=full_messages,
        temperature=0.6
    )

    result = response.choices[0].message.content
    final_cleaned_result = result.replace("```", "")
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