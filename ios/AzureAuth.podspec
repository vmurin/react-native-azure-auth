Pod::Spec.new do |s|
  s.name         = "AzureAuth"
  s.version      = "1.0.0"
  s.summary      = "React Native library implementing Azure AD OAuth2 API"
  s.homepage     = "https://github.com/vmurin/react-native-azure-auth"
  s.license      = "MIT"
  s.author       = { "vmurin" => "vmurin@gmail.com" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/author/AzureAuth.git", :tag => "master" }
  s.source_files  = "AzureAuth.{h,m}"
  s.requires_arc = true

  s.dependency "React"
end
