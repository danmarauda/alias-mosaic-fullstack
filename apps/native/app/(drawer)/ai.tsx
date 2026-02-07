import { api } from "@alias-mosaic-fullstack/backend/convex/_generated/api";
import { useUIMessages, useSmoothText, type UIMessage } from "@convex-dev/agent/react";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Button, Spinner, Surface, TextField, useThemeColor } from "heroui-native";
import { useRef, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";

import { Container } from "@/components/container";

function MessageContent({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  const [visibleText] = useSmoothText(text, {
    startStreaming: isStreaming,
  });
  return <Text className="text-foreground text-sm leading-relaxed">{visibleText}</Text>;
}

export default function AIScreen() {
  const [input, setInput] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const mutedColor = useThemeColor("muted");
  const foregroundColor = useThemeColor("foreground");

  const projects = useQuery(api.projects.list);
  const firstProjectId = useMemo(() => projects?.[0]?._id ?? null, [projects]);
  const activeProjectId = selectedProjectId ?? firstProjectId;
  const conversations = useQuery(
    api.conversations.listByProject,
    activeProjectId ? { projectId: activeProjectId } : "skip",
  );
  const firstConversationId = useMemo(() => conversations?.[0]?._id ?? null, [conversations]);
  const activeConversationId = selectedConversationId ?? firstConversationId;
  const activeConversation = useQuery(
    api.conversations.getById,
    activeConversationId ? { conversationId: activeConversationId } : "skip",
  );

  const threadId =
    activeConversation?.aiTabs.find((tab) => tab.id === activeConversation.activeAITabId)?.agentSessionId ??
    null;

  const createProject = useMutation(api.projects.create);
  const createConversation = useMutation(api.conversations.create);
  const upsertThreadTab = useMutation(api.conversations.upsertThreadTab);
  const createThread = useMutation(api.chat.createNewThread);
  const sendMessage = useMutation(api.chat.sendMessage);

  const { results: messages } = useUIMessages(
    api.chat.listMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 50, stream: true },
  );

  const hasStreamingMessage = messages?.some((m: UIMessage) => m.status === "streaming");

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const onSubmit = async () => {
    const value = input.trim();
    if (!value || isLoading) return;

    setIsLoading(true);
    setInput("");

    try {
      let projectId = activeProjectId;
      if (!projectId) {
        const project = await createProject({ name: "Default Project", path: "." });
        projectId = project?._id ?? null;
      }

      if (!projectId) {
        throw new Error("Failed to create project");
      }

      let conversationId = activeConversationId;
      if (!conversationId) {
        const conversation = await createConversation({
          projectId,
          name: "Main Conversation",
          firstMessage: value,
        });
        conversationId = conversation?._id ?? null;
        if (conversationId) {
          setSelectedConversationId(conversationId);
        }
      }

      if (!conversationId) {
        throw new Error("Failed to create conversation");
      }

      let currentThreadId = threadId;
      if (!currentThreadId) {
        currentThreadId = await createThread();
        await upsertThreadTab({
          conversationId,
          tabId: "tab-main",
          tabName: "Main",
          threadId: currentThreadId,
        });
      }

      await sendMessage({ threadId: currentThreadId, prompt: value });
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 px-4 py-4">
          <View className="py-4 mb-4">
            <Text className="text-2xl font-semibold text-foreground tracking-tight">AI Chat</Text>
            <Text className="text-muted text-sm mt-1">Chat with our AI assistant</Text>
            <View className="flex-row flex-wrap gap-2 mt-2">
              {projects?.map((project) => (
                <Button
                  key={project._id}
                  size="sm"
                  variant={activeProjectId === project._id ? "primary" : "secondary"}
                  onPress={() => {
                    setSelectedProjectId(project._id);
                    setSelectedConversationId(null);
                  }}
                >
                  <Button.Label>{project.name}</Button.Label>
                </Button>
              ))}
            </View>
            <View className="flex-row flex-wrap gap-2 mt-2">
              {conversations?.map((conversation) => (
                <Button
                  key={conversation._id}
                  size="sm"
                  variant={activeConversationId === conversation._id ? "primary" : "secondary"}
                  onPress={() => setSelectedConversationId(conversation._id)}
                >
                  <Button.Label>{conversation.name ?? "Untitled"}</Button.Label>
                </Button>
              ))}
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            className="flex-1 mb-4"
            showsVerticalScrollIndicator={false}
          >
            {!messages || messages.length === 0 ? (
              <View className="flex-1 justify-center items-center py-10">
                <Ionicons name="chatbubble-ellipses-outline" size={32} color={mutedColor} />
                <Text className="text-muted text-sm mt-3">Ask me anything to get started</Text>
              </View>
            ) : (
              <View className="gap-2">
                {messages.map((message: UIMessage) => (
                  <Surface
                    key={message.key}
                    variant={message.role === "user" ? "tertiary" : "secondary"}
                    className={`p-3 rounded-lg ${message.role === "user" ? "ml-10" : "mr-10"}`}
                  >
                    <Text className="text-xs font-medium mb-1 text-muted">
                      {message.role === "user" ? "You" : "AI"}
                    </Text>
                    <MessageContent
                      text={message.text ?? ""}
                      isStreaming={message.status === "streaming"}
                    />
                  </Surface>
                ))}
                {isLoading && !hasStreamingMessage && (
                  <Surface variant="secondary" className="p-3 mr-10 rounded-lg">
                    <Text className="text-xs font-medium mb-1 text-muted">AI</Text>
                    <View className="flex-row items-center gap-2">
                      <Spinner size="sm" />
                      <Text className="text-muted text-sm">Thinking...</Text>
                    </View>
                  </Surface>
                )}
              </View>
            )}
          </ScrollView>

          <View className="mb-3 h-px bg-muted" />

          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <TextField>
                <TextField.Input
                  value={input}
                  onChangeText={setInput}
                  placeholder="Type a message..."
                  onSubmitEditing={onSubmit}
                  editable={!isLoading}
                  autoFocus
                />
              </TextField>
            </View>
            <Button
              isIconOnly
              variant={input.trim() && !isLoading ? "primary" : "secondary"}
              onPress={onSubmit}
              isDisabled={!input.trim() || isLoading}
              size="sm"
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={input.trim() && !isLoading ? foregroundColor : mutedColor}
              />
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
}
