#include <iostream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>

using namespace std;

// Structure to hold input data for a single hour
struct HourlyInput {
    double temperature;
    double cloudCover;
    double sunHours; // effectively "is sun up?" factor or partial hour
};

// Function to split string by delimiter
vector<string> split(const string& s, char delimiter) {
    vector<string> tokens;
    string token;
    istringstream tokenStream(s);
    while (getline(tokenStream, token, delimiter)) {
        tokens.push_back(token);
    }
    return tokens;
}

int main(int argc, char* argv[]) {
    // Expected args: <PanelCapacity> <CSV_Data_String>
    // CSV Format: "temp1,cloud1,sun1;temp2,cloud2,sun2;..."
    
    if (argc < 3) {
        cerr << "Usage: " << argv[0] << " <PanelCapacity> <CSV_Data>" << endl;
        return 1;
    }

    try {
        double panelCapacity = stod(argv[1]);
        string csvData = argv[2];

        const double BASE_EFFICIENCY = 0.18;
        const double TEMP_COEFFICIENT = -0.004;
        const double REF_TEMP = 25.0;
        const double SYSTEM_LOSS_FACTOR = 0.14;

        vector<double> predictions;
        vector<string> hourGroups = split(csvData, ';');

        for (const string& hourData : hourGroups) {
            if (hourData.empty()) continue;

            vector<string> values = split(hourData, ',');
            if (values.size() < 3) {
                predictions.push_back(0.0);
                continue;
            }

            double temperature = stod(values[0]);
            double cloudCover = stod(values[1]);
            double sunHours = stod(values[2]); // 0 or 1, or fraction

            // 1. Temperature Efficiency Loss
            double cellTemp = temperature + (sunHours > 0 ? 25 : 0);
            double tempDifference = cellTemp - REF_TEMP;
            double efficiencyLoss = tempDifference * TEMP_COEFFICIENT;
            
            double currentEfficiency = BASE_EFFICIENCY * (1 + efficiencyLoss);
            if (currentEfficiency < 0.05) currentEfficiency = 0.05;
            if (currentEfficiency > 0.25) currentEfficiency = 0.25;

            // 2. Cloud Factor
            double cloudFactor = 1.0 - (cloudCover / 100.0 * 0.8);

            // 3. Production
            double production = panelCapacity * sunHours * cloudFactor * (1.0 + efficiencyLoss) * (1.0 - SYSTEM_LOSS_FACTOR);
            
            if (production < 0) production = 0;
            predictions.push_back(production);
        }

        // Output results as comma-separated string
        for (size_t i = 0; i < predictions.size(); ++i) {
            cout << fixed << setprecision(3) << predictions[i];
            if (i < predictions.size() - 1) cout << ",";
        }

        return 0;

    } catch (const exception& e) {
        cerr << "Error processing batch: " << e.what() << endl;
        return 1;
    }
}
