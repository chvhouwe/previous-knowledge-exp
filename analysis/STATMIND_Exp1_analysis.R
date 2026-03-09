#-----------
# Read in data
#-----------

setwd("~/Documents/STATMIND_Exp1_data")

rm(list = ls()) 

# Merge all data files  --------------------------------------------------
file_list = list.files(pattern = ".csv")

for (file in file_list){
  
  # if the merged dataset doesn't exist, create it
  if (!exists("dataset")){
    dataset <- read.csv(file)
  }
  
  # if the merged dataset does exist, append to it
  if (exists("dataset")){
    temp_dataset <- read.csv(file)
    dataset<-rbind(dataset, temp_dataset)
    rm(temp_dataset)
  }
  
}

df = dataset
df$stimulus_idx <- as.numeric(df$stimulus_idx)

library(readr)
stim <- read_delim("~/Documents/STATMINDStimuli.csv", delim = ";", show_col_types = FALSE, guess_max = 5000)

library(dplyr)
DF <- df %>%
  left_join(stim, by = "stimulus_idx")

DF$semantic_coherence <- as.numeric(DF$semantic_coherence)
DF$confidence <- as.numeric(DF$confidence)

#-----------
# Check target detection performance
#-----------
library(plyr)
DF_tdt <- subset(DF, DF$phase =="exposure_with_TDT")
persubj = ddply(DF_tdt, .(sona_participant_id), summarize, acc = tdt_accuracy) 

#-----------
# Seperate OldNew test performance
#-----------

df_test <- subset(DF, DF$phase =="OldNew_test")

df_test <- subset(df_test , df_test$sona_participant_id != -1)

df_test$MBF_scale <- scale(df_test$MBF)


df_test$sep_accuracy <- as.numeric(df_test$correct_response_test == df_test$response_OldNew_response)
df_test$resp <- as.numeric(df_test$response_OldNew_response == "d")

persubj = ddply(df_test, .(sona_participant_id), summarize, count = length(sep_accuracy), acc = mean(sep_accuracy)) #chance = 0.05
perorder = ddply(df_test, .(jatosCondition, language), summarize, count = length(sep_accuracy), acc = mean(sep_accuracy)) #chance = 0.05
perlang = ddply(df_test, .(language), summarize, count = length(sep_accuracy), acc = mean(sep_accuracy)) #chance = 0.05
pertype = ddply(df_test, .(type), summarize, count = length(resp), acc = mean(resp)) #chance = 0.05

summary(persubj$acc)
hist(persubj$acc)
t.test(persubj$acc, mu = 0.5) #significantly above chance

dprimepersubj = ddply(df_test, .(sona_participant_id), summarize,
    hits = sum(type == "target" & response_OldNew_response == "d"),
    misses = sum(type == "target" & response_OldNew_response == "k"),
    fas = sum(type == "foil" & response_OldNew_response == "d"),
    cr = sum(type == "foil" & response_OldNew_response == "k"),
    hit_rate = (hits + 0.5) / (hits + misses + 1),
    fa_rate = (fas + 0.5) / (fas + cr + 1),
    dprime = qnorm(hit_rate) - qnorm(fa_rate))

summary(dprimepersubj$dprime)
hist(dprimepersubj$dprime)
t.test(dprimepersubj$dprime, mu = 0.0) 

library(lme4)
library(ggeffects)

model0 <- glmer(sep_accuracy ~ language + (1|sona_participant_id), data = df_test, family = binomial(link = "logit"))
summary(model0) #L2 was learned better

# (1) Surface indices (Bigram frequency and Orthographic Neighborhood Density)
# Note LD (range only 1-2) was not a significant predictor, hence omitted 

#effect code type! 
df_test$type <- as.factor(df_test$type)
contrasts(df_test$type) <- contr.sum(levels(df_test$type))

model1 <- glmer(resp ~ type*MBF_scale + type*OND20 + (1|sona_participant_id), data = df_test, family = binomial(link = "logit"))
summary(model1)

pred <- ggpredict(model1, terms = c("type", "MBF_scale"))
plot(pred)

pred <- ggpredict(model1, terms = c("type", "OND20"))
plot(pred)

# on confidence of correct trials correct 
df_test_correct <- subset (df_test, sep_accuracy == 1)

model11 <- lmer(confidence ~ type*MBF_scale + type*OND20 + (1|sona_participant_id), data = df_test_correct)
summary(model11)

pred <- ggpredict(model11, terms = c("type", "OND20"))
plot(pred)
#No effects on confidence

# Both show the expected effect, with more language-like foils being harder to reject, 
# whereas especially targets that do not follow not follow native language structure are correctly accepted

# (2) Add semantic indices (Bigram frequency and Orthographic Neighborhood Density)

model2 <- glmer(resp ~ type*MBF_scale + type*semantic_coherence + (1|sona_participant_id), data = df_test, family = binomial(link = "logit"))
summary(model2)

pred <- ggpredict(model2, terms = c("type", "semantic_coherence"))
plot(pred)

model12 <- lmer(confidence ~ type:MBF_scale + type*semantic_coherence + (1|sona_participant_id), data = df_test_correct)
summary(model12) # no effects on confidence

#It's easier to reject foils that have higher semantic coherence, little effect on target acceptance but trend in opposite direction

model3 <- glmer(resp ~ type*MBF_scale + type*SND + (1|sona_participant_id), data = df_test, family = binomial(link = "logit"))
summary(model3)

pred <- ggpredict(model3, terms = c("type", "SND"))
plot(pred)

model13 <- lmer(confidence ~ type:MBF_scale + type + type:SND + (1|sona_participant_id), data = df_test_correct)
summary(model13) # no effects on confidence

# similar results, It's easier to reject foils that have denser semantic neighborhood, but same for targets

#-----------
# Mixed OldNew test performance
#-----------

df_test <- subset(DF, DF$phase =="Mixed_OldNew_test") 

df_test <- subset(df_test , df_test$sona_participant_id != -1)

df_test$MBF_scale <- scale(df_test$MBF)

df_test$mixed_accuracy <- as.numeric(df_test$correct_response_mixed == df_test$response_mixed_OldNew_response)
df_test$resp <- as.numeric(df_test$response_mixed_OldNew_response == "d")

library(plyr)
persubj = ddply(df_test, .(sona_participant_id), summarize, count = length(mixed_accuracy), acc = mean(mixed_accuracy)) #chance = 0.05

summary(persubj$acc)
hist(persubj$acc)
t.test(persubj$acc, mu = 0.5) #NOT significantly above chance

# (1) Surface indices (Bigram frequency and Orthographic Neighborhood Density)

model1 <- glmer(resp ~ type:MBF_scale + type:OND20 + (1|sona_participant_id), data = df_test, family = binomial(link = "logit"))
summary(model1)

pred <- ggpredict(model1, terms = c("type", "MBF_scale"))
plot(pred)

# Weak (non-sign) effect

# (2) Add semantic indices (Bigram frequency and Orthographic Neighborhood Density)

model2 <- glmer(resp ~ type:MBF_scale + type*semantic_coherence + (1|sona_participant_id), data = df_test, family = binomial(link = "logit"))
summary(model2)

pred <- ggpredict(model2, terms = c("type", "semantic_coherence"))
plot(pred)

#It's easier to reject foils that have higher semantic coherence, little effect on target acceptance

model3 <- glmer(resp ~ type:MBF_scale + type:SND + (1|sona_participant_id), data = df_test, family = binomial(link = "logit"))
summary(model3)

pred <- ggpredict(model3, terms = c("type", "SND"))
plot(pred)

# similar results, It's easier to reject foils that have higher semantic neighborhood, but same for targets

