
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Calendar, CheckCircle2, Clock } from "lucide-react-native";

export interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "pending" | "in-progress" | "completed";
  onViewDetails?: () => void;
}

// Helper function to determine badge details based on status
const getStatusDetails = (status: ServiceCardProps["status"]) => {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        color: "#f3f4f6", // secondary color equivalent
        textColor: "#6b7280", // muted text color
        icon: Clock,
      };
    case "in-progress":
      return {
        label: "In Progress",
        color: "#f3f4f6", // secondary color equivalent
        textColor: "#6b7280", // muted text color
        icon: Calendar,
      };
    case "completed":
      return {
        label: "Completed",
        color: "#10b981", // primary/green color equivalent
        textColor: "#ffffff", // white text
        icon: CheckCircle2,
      };
    default:
      return {
        label: "Unknown",
        color: "#e5e7eb", // outline color equivalent
        textColor: "#6b7280", // muted text color
        icon: Clock,
      };
  }
};

export default function ServiceCard({
  id,
  title,
  description,
  date,
  status,
  onViewDetails,
}: ServiceCardProps) {
  const statusDetails = getStatusDetails(status);
  const StatusIcon = statusDetails.icon;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.badge, { backgroundColor: statusDetails.color }]}>
            <StatusIcon size={14} color={statusDetails.textColor} style={styles.badgeIcon} />
            <Text style={[styles.badgeText, { color: statusDetails.textColor }]}>
              {statusDetails.label}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>Requested on {date}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.description}>{description}</Text>
      </View>
      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={onViewDetails}
        >
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  date: {
    fontSize: 14,
    color: "#6b7280",
  },
  cardContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.8)",
  },
  cardFooter: {
    padding: 16,
    paddingTop: 8,
  },
  button: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
});
