import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

type Question = {
  question: string;
  correct_answer: string;
};

const API_URL = "https://opentdb.com/api.php?amount=10&type=boolean";

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;/g, "’")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
}

const Easy = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        const results: Question[] = data.results || [];
        setQuestions(results);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(String(e));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleAnswer = (answer: string) => {
    if (!questions[index]) return;
    setSelected(answer);
    if (answer === questions[index].correct_answer) {
      setScore((s) => s + 1);
    }
  };

  const next = () => {
    setSelected(null);
    setIndex((i) => i + 1);
  };

  const restart = () => {
    setQuestions([]);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setError(null);
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setQuestions(data.results || []))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Chargement des questions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>Erreur: {error}</Text>
        <TouchableOpacity style={styles.plainButton} onPress={restart} activeOpacity={0.8}>
          <Text style={styles.plainButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (index >= questions.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Quiz terminé</Text>
        <Text style={styles.score}>Score: {score} / {questions.length}</Text>
        <TouchableOpacity style={styles.plainButton} onPress={restart} activeOpacity={0.8}>
          <Text style={styles.plainButtonText}>Recommencer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const q = questions[index];
  const questionText = decodeHtmlEntities(q.question || "");

  return (
    <View style={styles.container}>
      <Text style={styles.counter}>Question {index + 1} / {questions.length}</Text>
      <View style={styles.questionBox}>
        <Text style={styles.question}>{questionText}</Text>
      </View>

      <View style={styles.buttons}>
        {['True','False'].map((a) => {
          const isCorrect = a === q.correct_answer;
          const isSelected = selected === a;
          const showResult = selected !== null;
          const btnStyle: any = [styles.choiceButton];
          if (showResult) {
            if (isCorrect) btnStyle.push(styles.correct);
            else if (isSelected) btnStyle.push(styles.incorrect);
            else btnStyle.push(styles.dimmed);
          }
          return (
            <TouchableOpacity
              key={a}
              style={btnStyle}
              activeOpacity={0.8}
              onPress={() => handleAnswer(a)}
              disabled={!!selected}
            >
              <Text style={styles.choiceText}>{a}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.round(((index + 1) / questions.length) * 100)}%` }]} />
      </View>

      {selected && (
        <View style={styles.feedback}>
          <Text>{selected === q.correct_answer ? "Bonne réponse ✅" : "Mauvaise réponse ❌"}</Text>
          <TouchableOpacity style={[styles.plainButton, {marginTop:8}]} onPress={next} activeOpacity={0.8}>
            <Text style={styles.plainButtonText}>{index + 1 < questions.length ? "Question suivante" : "Voir le score"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <Text>Score: {score}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "flex-start",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  score: {
    fontSize: 18,
    marginBottom: 12,
  },
  counter: {
    marginBottom: 8,
  },
  questionBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 12,
  },
  question: {
    fontSize: 18,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    width: '0%'
  },
  choiceButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 12,
    backgroundColor: '#1976d2',
    borderRadius: 8,
    alignItems: 'center',
  },
  choiceText: {
    color: '#fff',
    fontWeight: '600'
  },
  correct: {
    backgroundColor: '#2e7d32'
  },
  incorrect: {
    backgroundColor: '#c62828'
  },
  dimmed: {
    opacity: 0.6,
    backgroundColor: '#90a4ae'
  },
  plainButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#1976d2',
    borderRadius: 8,
    alignItems: 'center'
  },
  plainButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  button: {
    flex: 1,
    marginHorizontal: 6,
  },
  feedback: {
    marginTop: 8,
  },
  footer: {
    marginTop: 16,
  },
});

export default Easy;
