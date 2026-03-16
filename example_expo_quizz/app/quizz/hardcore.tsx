import React, { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";

type Question = {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

const API_URL = "https://opentdb.com/api.php?amount=10&difficulty=hard&type=multiple";

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&rsquo;/g, "’")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
}

function shuffle<T>(array: T[]) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const Hardcore = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted.current) return;
        const results: Question[] = data.results || [];
        setQuestions(results);
        if (results[0]) {
          const a = shuffle([results[0].correct_answer, ...results[0].incorrect_answers]);
          setAnswers(a);
        }
      })
      .catch((e) => {
        if (!isMounted.current) return;
        setError(String(e));
      })
      .finally(() => {
        if (!isMounted.current) return;
        setLoading(false);
      });
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const q = questions[index];
    if (q) {
      setAnswers(shuffle([q.correct_answer, ...q.incorrect_answers]));
    }
  }, [index, questions]);

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
      .then((data) => {
        if (!isMounted.current) return;
        setQuestions(data.results || []);
        if (data.results && data.results[0]) {
          setAnswers(shuffle([data.results[0].correct_answer, ...data.results[0].incorrect_answers]));
        }
      })
      .catch((e) => { if (isMounted.current) setError(String(e)); })
      .finally(() => { if (isMounted.current) setLoading(false); });
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
        <Text style={styles.title}>Quiz Hardcore terminé</Text>
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

      <View style={styles.answers}>
        {answers.map((a, i) => {
          const isCorrect = a === q.correct_answer;
          const isSelected = selected === a;
          const showResult = selected !== null;
          const styleBtn: any = [styles.answerButton];
          if (showResult) {
            if (isCorrect) styleBtn.push(styles.correct);
            else if (isSelected) styleBtn.push(styles.incorrect);
            else styleBtn.push(styles.dimmed);
          }
          return (
            <TouchableOpacity key={`${index}-${i}`} style={styleBtn} disabled={!!selected} activeOpacity={0.8} onPress={() => handleAnswer(a)}>
              <Text style={styles.choiceText}>{decodeHtmlEntities(a)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected && (
        <View style={styles.feedback}>
          <Text>{selected === q.correct_answer ? "Bonne réponse ✅" : `Mauvaise réponse ❌ (Réponse: ${decodeHtmlEntities(q.correct_answer)})`}</Text>
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
  answers: {
    marginBottom: 12,
  },
  answerButton: {
    marginVertical: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#1565c0',
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
  feedback: {
    marginTop: 8,
  },
  footer: {
    marginTop: 16,
  },
});

export default Hardcore;
