import { NextResponse } from 'next/server';

// Simple tokenization function
function tokenize(text) {
  return text.toLowerCase().split(/\s+/).filter(token => token.length > 2);
}

// Simple cosine similarity function
function cosineSimilarity(query, document) {
  const queryTokens = tokenize(query);
  const docTokens = tokenize(document);
  
  // Count tokens in query
  const queryVector = {};
  for (const token of queryTokens) {
    queryVector[token] = (queryVector[token] || 0) + 1;
  }
  
  // Count tokens in document
  const docVector = {};
  for (const token of docTokens) {
    docVector[token] = (docVector[token] || 0) + 1;
  }
  
  // Calculate dot product
  let dotProduct = 0;
  for (const token in queryVector) {
    if (docVector[token]) {
      dotProduct += queryVector[token] * docVector[token];
    }
  }
  
  // Calculate magnitudes
  let queryMagnitude = 0;
  for (const token in queryVector) {
    queryMagnitude += queryVector[token] * queryVector[token];
  }
  queryMagnitude = Math.sqrt(queryMagnitude);
  
  let docMagnitude = 0;
  for (const token in docVector) {
    docMagnitude += docVector[token] * docVector[token];
  }
  docMagnitude = Math.sqrt(docMagnitude);
  
  // Calculate cosine similarity
  if (queryMagnitude === 0 || docMagnitude === 0) return 0;
  return dotProduct / (queryMagnitude * docMagnitude);
}

// Main function to retrieve relevant documents
export async function POST(request) {
  try {
    const { query, threshold = 0.1 } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid query' },
        { status: 400 }
      );
    }

    // Mock document database for demonstration
    // In a real implementation, this would be retrieved from a vector database
    const documents = [
      {
        id: 'lyriq-range',
        title: 'LYRIQ Range',
        content: 'The Cadillac LYRIQ offers an impressive range of up to 530 km on a single charge according to WLTP standards. This makes it one of the most efficient luxury electric SUVs in its class.',
        source: 'LYRIQ Specifications'
      },
      {
        id: 'lyriq-battery',
        title: 'LYRIQ Battery System',
        content: 'The Cadillac LYRIQ features a state-of-the-art 102 kWh Ultium battery with active liquid cooling. The battery supports DC fast charging at up to 190 kW, allowing you to add approximately 200 km of range in just 10 minutes.',
        source: 'LYRIQ Technical Manual'
      },
      {
        id: 'lyriq-performance',
        title: 'LYRIQ Performance',
        content: 'With 388 kW of power and 610 Nm of torque, the Cadillac LYRIQ accelerates from 0 to 100 km/h in just 4.9 seconds. The all-wheel drive system provides exceptional traction and handling in all weather conditions.',
        source: 'LYRIQ Owner\'s Manual'
      },
      {
        id: 'lyriq-features',
        title: 'LYRIQ Premium Features',
        content: 'The Cadillac LYRIQ comes equipped with a 33-inch curved LED display, AKG premium sound system with 19 speakers, Super Cruise hands-free driving technology, and a panoramic glass roof.',
        source: 'LYRIQ Owner\'s Manual'
      },
      {
        id: 'lyriq-awards',
        title: 'LYRIQ Awards',
        content: 'The Cadillac LYRIQ has been recognized as the German Car of the Year 2025 in the Luxury Category. This marks the first time an American brand has received this prestigious award in Europe.',
        source: 'Automotive Press Release'
      },
      {
        id: 'optiq-intro',
        title: 'OPTIQ Introduction',
        content: 'The Cadillac OPTIQ is a compact electric luxury crossover that combines efficiency with premium features. As the newest addition to Cadillac\'s electric vehicle lineup, it offers a balance of performance and luxury in a smaller package.',
        source: 'OPTIQ Owner\'s Manual'
      },
      {
        id: 'optiq-specs',
        title: 'OPTIQ Specifications',
        content: 'The Cadillac OPTIQ features a 74 kWh battery providing up to 465 km of range (WLTP). With 280 kW of power and 490 Nm of torque, it accelerates from 0-100 km/h in 5.4 seconds.',
        source: 'OPTIQ Technical Manual'
      }
    ];

    // In a real implementation, this would be a more sophisticated retrieval mechanism
    // For now, we'll use simple cosine similarity
    const relevantDocuments = documents
      .map(doc => ({
        ...doc,
        similarity: cosineSimilarity(query, doc.content)
      }))
      .filter(doc => doc.similarity > threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3); // Get top 3 most relevant docs

    return NextResponse.json({
      success: true,
      query,
      results: relevantDocuments
    });

  } catch (error) {
    console.error('Error retrieving documents:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve documents' },
      { status: 500 }
    );
  }
} 