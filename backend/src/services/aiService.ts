// Simple rule-based AI service for learning resource recommendations
export function generateLearningResources(grades: any[]) {
  const resources: any[] = []

  // Analyze grades and suggest resources
  grades.forEach((grade) => {
    const percentage = (grade.score / grade.maxScore) * 100

    if (percentage < 60) {
      // Struggling - suggest basic resources
      resources.push({
        id: `${grade.id}-basic`,
        title: `${grade.subject} - Basic Concepts Review`,
        description: `Fundamental concepts and practice exercises for ${grade.subject}`,
        url: `https://example.com/basic-${grade.subject.toLowerCase()}`,
        subject: grade.subject,
        difficulty: "Basic",
      })
    } else if (percentage < 80) {
      // Average - suggest intermediate resources
      resources.push({
        id: `${grade.id}-intermediate`,
        title: `${grade.subject} - Skill Building`,
        description: `Intermediate exercises and problem-solving for ${grade.subject}`,
        url: `https://example.com/intermediate-${grade.subject.toLowerCase()}`,
        subject: grade.subject,
        difficulty: "Intermediate",
      })
    } else {
      // Excellent - suggest advanced resources
      resources.push({
        id: `${grade.id}-advanced`,
        title: `${grade.subject} - Advanced Challenges`,
        description: `Advanced topics and enrichment activities for ${grade.subject}`,
        url: `https://example.com/advanced-${grade.subject.toLowerCase()}`,
        subject: grade.subject,
        difficulty: "Advanced",
      })
    }
  })

  return resources
}
