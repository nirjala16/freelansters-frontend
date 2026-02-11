"use client";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Download, Loader } from "lucide-react";
// Define styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 40,
  },
  companyInfo: {
    fontSize: 10,
    textAlign: "right",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  invoiceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  invoiceDetails: {
    width: "50%",
  },
  invoiceLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 3,
  },
  invoiceValue: {
    fontSize: 12,
    marginBottom: 10,
  },
  clientDetails: {
    width: "50%",
    textAlign: "right",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  table: {
    display: "flex",
    width: "auto",
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: "#f6f6f6",
  },
  tableCol1: {
    width: "50%",
    paddingHorizontal: 8,
  },
  tableCol2: {
    width: "25%",
    paddingHorizontal: 8,
  },
  tableCol3: {
    width: "25%",
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 10,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 20,
  },
  totalValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  milestoneItem: {
    marginBottom: 10,
  },
  milestoneTitle: {
    fontSize: 11,
    fontWeight: "bold",
  },
  milestoneDescription: {
    fontSize: 9,
    color: "#666",
  },
  milestoneStatus: {
    fontSize: 9,
    color: "#4CAF50",
    marginTop: 2,
  },
  badge: {
    fontSize: 9,
    color: "#4CAF50",
    marginTop: 2,
  },
  platformFee: {
    fontSize: 10,
    color: "#666",
    fontStyle: "italic",
    marginTop: 5,
  },
});

// PDF Document Component
const InvoicePDF = ({ transaction, companyName = "Freelansters Inc." }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (amount, currency = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  // Calculate platform fee (10%)
  const platformFee = transaction.amount * 0.1;
  const netAmount = transaction.amount - platformFee;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FREELANSTERS INVOICE</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>{companyName}</Text>
            <Text>10 Freelansters</Text>
            <Text>Kathmandu, Nepal</Text>
            <Text>support@freelansters.com</Text>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={styles.invoiceInfo}>
          <View style={styles.invoiceDetails}>
            <Text style={styles.invoiceLabel}>INVOICE TO</Text>
            <Text style={styles.invoiceValue}>{transaction.client.name}</Text>
            <Text style={styles.invoiceValue}>{transaction.client.email}</Text>
            <Text style={styles.invoiceLabel}>FREELANCER</Text>
            <Text style={styles.invoiceValue}>
              {transaction.freelancer.name}
            </Text>
          </View>
          <View style={styles.clientDetails}>
            <Text style={styles.invoiceLabel}>INVOICE NUMBER</Text>
            <Text style={styles.invoiceValue}>
              INV-{transaction._id.substring(0, 8)}
            </Text>
            <Text style={styles.invoiceLabel}>DATE</Text>
            <Text style={styles.invoiceValue}>
              {formatDate(transaction.createdAt)}
            </Text>
            <Text style={styles.invoiceLabel}>STATUS</Text>
            <Text style={styles.invoiceValue}>
              {transaction.paymentStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Job Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCol1}>
                <Text style={styles.tableHeaderCell}>Description</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={styles.tableHeaderCell}>Category</Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.tableHeaderCell}>Amount</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={styles.tableCell}>{transaction.job.title}</Text>
                <Text
                  style={[
                    styles.tableCell,
                    { fontSize: 8, color: "#666", marginTop: 3 },
                  ]}
                >
                  {transaction.job.description.substring(0, 100)}
                  {transaction.job.description.length > 100 ? "..." : ""}
                </Text>
              </View>
              <View style={styles.tableCol2}>
                <Text style={styles.tableCell}>
                  {transaction.job.jobCategory}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { fontSize: 8, color: "#666", marginTop: 3 },
                  ]}
                >
                  {transaction.job.jobType}
                </Text>
              </View>
              <View style={styles.tableCol3}>
                <Text style={styles.tableCell}>
                  {formatCurrency(transaction.amount, transaction.currency)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(transaction.amount, transaction.currency)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Platform Fee (10%):</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(platformFee, transaction.currency)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Net Amount:</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(netAmount, transaction.currency)}
            </Text>
          </View>
        </View>

        {/* Milestones */}
        {transaction.projectId &&
          transaction.projectId.milestones &&
          transaction.projectId.milestones.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Project Milestones</Text>
              {transaction.projectId.milestones.map((milestone, index) => (
                <View key={index} style={styles.milestoneItem}>
                  <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                  <Text style={styles.milestoneDescription}>
                    {milestone.description}
                  </Text>
                  <Text style={styles.milestoneStatus}>
                    Status:{" "}
                    {milestone.status.charAt(0).toUpperCase() +
                      milestone.status.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          )}

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.invoiceInfo}>
            <View style={styles.invoiceDetails}>
              <Text style={styles.invoiceLabel}>PAYMENT METHOD</Text>
              <Text style={styles.invoiceValue}>
                {transaction.paymentMethod}
              </Text>
              <Text style={styles.invoiceLabel}>TRANSACTION ID</Text>
              <Text style={styles.invoiceValue}>
                {transaction.transaction_uuid}
              </Text>
            </View>
            <View style={styles.clientDetails}>
              <Text style={styles.invoiceLabel}>PAYMENT DATE</Text>
              <Text style={styles.invoiceValue}>
                {formatDate(transaction.createdAt)}
              </Text>
              <Text style={styles.invoiceLabel}>PAYMENT STATUS</Text>
              <Text style={styles.invoiceValue}>
                {transaction.paymentStatus.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for using our platform!</Text>
          <Text>
            This invoice was generated on {new Date().toLocaleDateString()}
          </Text>
          <a href="https://freelanstersbysoyam.vercel.app/" target="_blank"></a>
          <Text>
            For any questions, please contact support@freelansters.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};

InvoicePDF.propTypes = {
  transaction: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    paymentStatus: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string.isRequired,
    transaction_uuid: PropTypes.string.isRequired,
    client: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
    freelancer: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
    job: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      jobCategory: PropTypes.string.isRequired,
      jobType: PropTypes.string.isRequired,
    }).isRequired,
    projectId: PropTypes.shape({
      milestones: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          description: PropTypes.string.isRequired,
          status: PropTypes.string.isRequired,
        })
      ),
    }),
  }).isRequired,
  companyName: PropTypes.string,
};

// Invoice Generator Component
const InvoiceGenerator = ({ transaction }) => {
  if (!transaction) return null;

  return (
    <PDFDownloadLink
      document={<InvoicePDF transaction={transaction} />}
      fileName={`Freelansters-invoice-${transaction._id.substring(0, 8)}.pdf`}
    >
      {({ loading }) =>
        loading ? (
          <>
            <Button variant="outline">
              <Loader className="animate-spin" />
              Generating Invoice...
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline">
              <Download />
              Download Invoice
            </Button>
          </>
        )
      }
    </PDFDownloadLink>
  );
};

InvoiceGenerator.propTypes = {
  transaction: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    paymentStatus: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string.isRequired,
    transaction_uuid: PropTypes.string.isRequired,
    client: PropTypes.shape({
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
    freelancer: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
    job: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      jobCategory: PropTypes.string.isRequired,
      jobType: PropTypes.string.isRequired,
    }).isRequired,
    projectId: PropTypes.shape({
      milestones: PropTypes.arrayOf(
        PropTypes.shape({
          title: PropTypes.string.isRequired,
          description: PropTypes.string.isRequired,
          status: PropTypes.string.isRequired,
        })
      ),
    }),
  }).isRequired,
};

export default InvoiceGenerator;
